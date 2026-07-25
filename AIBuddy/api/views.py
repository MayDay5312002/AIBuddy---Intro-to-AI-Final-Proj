from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import StreamingHttpResponse

from tika import parser
from bs4 import BeautifulSoup


from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs


from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from langchain.docstore.document import Document

from ollama import chat
import ollama, docker, requests
from pydantic import BaseModel, ValidationError


from AIBuddy.models import *
from django.shortcuts import get_object_or_404

import ast, random, json, xmltodict
import subprocess
from openai import OpenAI
import openai

from AIBuddy.serializers import *
from AIBuddy.services import get_ai_space

# EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# embedding_model = HuggingFaceEmbeddings(model_name="./models/all-MiniLM-L6-v2")
embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")


import os
#   your views here.


vectorStore = None
documentName = None
tempVectorStore = None
kiwixContainer = None


############Format Outputs#################
class FlashCard(BaseModel):
  title: str
  content: str

class FlashCardsList(BaseModel):
  cards : list[FlashCard]

class QuizCard(BaseModel):
  question: str
  answer: str
  choices: list[str]

class QuizCards(BaseModel):
  questions : list[QuizCard]




#########################################

        
# class ChatAIView(APIView):
#     # global vectorStore
#     def get(self, request):
#         global vectorStore
#         query = request.GET.get("query")
#         modelName = request.GET.get("model")
#         results = query_vectorstore(query)
#         message = f"Answer this prompt: {query}\n\nContent: {results}"
#         ollama.c
#         response = chat(model=modelName, messages=[
#             {"role": "system", "content": "You are a helpful tutor that will respond in sentence and paragraph form."},
#             {"role": "user", "content": message}
#             ])
#         messegeResponse  = response['message']['content']
#         return Response({"msg": messegeResponse}, status=200)
    

def chatWithFile(request):
    """
    This function takes a query, modelName, and thread as parameters and returns a text/event-stream response.
    The event stream will contain the response from the AI model to the given query.
    The first message will be the prompt and content, followed by the AI model's response.

    The function also saves the query and response to the Message model for the given thread.
    """
    query = request.GET.get("query")
    modelName = request.GET.get("model")
    thread = request.GET.get("thread")
    executionType = request.GET.get("executionType")#########################################################
    setting = AISpace.objects.get(id=1)
    temperature = setting.temperature
    topP = setting.top_p
    maxTokens = setting.max_tokens
    apiKey = setting.api_key
    aiSpace = setting.ai_space
    modelNameOnline = setting.model_name
    baseUrl = setting.base_url
    # print("temperature: ", temperature)
    # print("topP: ", topP)
    # print("maxTokens: ", maxTokens)
    # print("apiKey: ", apiKey)
    # print("aiSpace: ", aiSpace)
    # print("modelNameOnline: ", modelNameOnline)
    # print("baseUrl: ", baseUrl)

    if executionType == "Explain with web search" or executionType == "Explain with Kiwix": #Check if docker is running for these execution types. If not started return proper error
        try:
            docker.from_env()
        except:
            def error_stream():
                yield "data: {\"error\": \"Docker is not running\"}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingHttpResponse(error_stream(), content_type="text/event-stream")
        


    print(executionType)
    # print("Thead: ", thread)
    thread = Thread.objects.get(title=thread)
    messagesUser = Message.objects.filter(thread=thread).order_by("created_at")
    messagesUser = [{"role": msg.role, "content": msg.instructions if msg.role == "user" else msg.content} for msg in messagesUser]
    results = []
    if(executionType == "Explain with document"):
        results = query_vectorstore(query)
        results = [chunk.page_content for chunk in results] #We dont have to include the metadata
    elif(executionType == "Explain with Kiwix"):
        print(executionType)
        docResults = get_kiwix_documents(query)
        results = [chunk.page_content for chunk in docResults]
    elif(executionType == "Explain with web search"):
        print(executionType)
        docResults = get_web_documents(query)
        if docResults == "404":
            def error_stream():
                yield "data: {\"error\": \"SearXNG container is not running\"}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingHttpResponse(error_stream(), content_type="text/event-stream")
        results = [chunk.page_content for chunk in docResults]
    # finalResponse = ""
    def event_stream(results = results):
        global vectorStore
        thinking = True
        # thinkingText = "<think>"
        # doneThinkingText = "</think>"
        # query = request.GET.get("query")
        # modelName = request.GET.get("model")
        # results = query_vectorstore(query)
        finalResponse = ""
        if(executionType != "Explain Simply"):
            message = f"Read the following prompt and content carefully. Provide a comprehensive, detailed, and well-structured response to the prompt, directly utilizing the supplied content for support and context. Clearly explain your reasoning and organize your answer with appropriate headings, bullet points, or lists as needed for readability. If any aspect is unclear, state your assumptions. Try not to reference prior conversations—focus only on the information provided. The provided content might be not directly related to the prompt. Respond in markdown format.\n\nPrompt:{query}\nContent:{results}"
        else:
            message = f"Read the following prompt carefully. Provide a comprehensive, detailed and well-structured response to the prompt using your knowledge. Repond in markdown format.\n\n Prompt:{query}"
        print(message)

        if aiSpace == "Ollama":
            optionToSend = {}
            if temperature :
                optionToSend["temperature"] = temperature
            if topP:
                optionToSend["top_p"] = topP
            if maxTokens:
                optionToSend["num_predict"] = maxTokens

            print(optionToSend)
            stream = chat(model=modelName, 
                messages=messagesUser + [{"role": "user", "content": message}],
                options=optionToSend,
                stream=True)
        else:
            client = OpenAI(
              base_url = baseUrl,
              api_key = apiKey
            )
            try:
                if not isNewModel(client, modelNameOnline):
                    stream = client.chat.completions.create(model=modelNameOnline, 
                        messages=messagesUser + [{"role": "user", "content": message}],
                        temperature=float(temperature) if temperature else 0.7,
                        top_p=float(topP) if topP else 1.0,
                        max_tokens=int(maxTokens) if maxTokens else 4096,
                        stream=True)

                else:
                    stream = client.chat.completions.create(model=modelNameOnline, 
                        messages=messagesUser + [{"role": "user", "content": message}],
                        temperature=float(temperature) if temperature else 0.7,
                        top_p=float(topP) if topP else 1.0,
                        max_completion_tokens=int(maxTokens) if maxTokens else 4096,
                        stream=True)
            except openai.APIError as e:
                yield f"data: {{\"error\": \"{e.message}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return
            except openai.APIConnectionError as e:
                yield f"data: {{\"error\": \"Connection failed: {e.message}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return
            except openai.OpenAIError as e:
                yield f"data: {{\"error\": \"{e.message}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return
        

        print(aiSpace)
        thinkingProcessor = ""
        for chunk in stream:
            content = ""
            if aiSpace == "Ollama":
                content = chunk["message"]["content"]
            else:
                if chunk.choices and chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
            if finalResponse == "" and thinking:
                thinkingProcessor += content
                if len(thinkingProcessor.strip()) >= 7 and thinkingProcessor.strip()[:7].lower() != "<think>":
                    print(f"THINKING: {thinking}")
                    thinking = False
                    finalResponse += thinkingProcessor
                    lines = thinkingProcessor.split("\n")
                    for line in lines:
                        yield f"data: {line}\n"
                    yield "\n"  # end of event
                    continue
                if "</think>" in thinkingProcessor.lower():
                    thinking = False
                    print(f"THINKING: {thinking}")
                    toSend = thinkingProcessor.lower().split("</think>")[-1]
                    if len(toSend) > 0:
                        finalResponse += toSend
                        lines = toSend.split("\n")
                        for line in lines:
                            yield f"data: {line}\n"
                        yield "\n"  # end of event
                    continue
            if thinking == False:
                finalResponse += content
                lines = content.split("\n")
                for line in lines:
                    yield f"data: {line}\n"
                yield "\n"  # end of event

        # for chunk in stream:
        #     content = chunk["message"]["content"]
        #     # content = content.replace("\n", "<br>")
        #     finalResponse += content
        #     # print(finalResponse)
        #     yield f"data: {content}\n\n"
        #     # Heartbeat to reduce buffering and keep client connection alive
        #     yield "data: \n\n"
        # print(finalResponse)
        if(executionType == "Explain with document"):
            nameOfDocument = documentName
        elif (executionType == "Explain with Kiwix" or executionType == "Explain with web search"):
            mySet = {doc.metadata["source"] for doc in docResults}
            nameOfDocument = ", ".join(mySet)
        else:
            nameOfDocument = "Explain simply"



        Message.objects.create(thread=thread, role="user", content=query, instructions=message, document= nameOfDocument)
        Message.objects.create(thread=thread, role="assistant", content=finalResponse)
        yield "data: [DONE]\n\n"

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    return response


class CreateFlashCardsView(APIView):
    def post(self, request):
        """
        This function takes a query, modelName, thread, and number as parameters and returns a json response.
        The json response will contain a list of flashcards with attributes title and content.
        The function also saves the flashcards to the FlashCards model for the given thread.

        The function also uses the chat function from the ollama library to generate the flashcards based on the query and content.
        The chat function takes the query and content as input and returns a response that contains the flashcards.
        The response is then validated using the FlashCardsList.model_validate_json function and the validated response is then used to create the flashcards.
        The function also limits the number of flashcards created to the given number.
        """
        try:
            query = request.data.get("query")
            modelName = request.data.get("model")
            thread = request.data.get("thread")
            number = int(request.data.get("number"))
            inputType = request.data.get("inputType")
            aiSpace = AISpace.objects.get(id=1).ai_space
            # print("Thead: ", thread)
            thread = Thread.objects.get(title=thread)
            messagesUser = Message.objects.filter(thread=thread).order_by("created_at")
            messagesUser = [{"role": msg.role, "content": msg.instructions if msg.role == "user" else msg.content} for msg in messagesUser]
            if inputType == "file" or inputType == "url": #If the input type is file or url, then we need to query the vector store first
                results = query_vectorstore(query)
                results = [chunk.page_content for chunk in results] #We dont have to include the metadata
            elif inputType == "web search":
                docResults = get_web_documents(query)
                if docResults == "404":
                    return Response({"error": "SearXNG container is not running"}, status=404)
                results = [chunk.page_content for chunk in docResults]
            elif inputType == "Kiwix":
                docResults = get_kiwix_documents(query)
                results = [chunk.page_content for chunk in docResults]

            if inputType != "model":
                message = f"Create {number} flash card(s) with attributes title and content for the following prompt and content(Ensure you follow the number of cards that should be created).\n"
                message += f"Make it as concise as possible.\n\nprompt: {query}\nContent: {results}"
            else:
                message = f"Create {number} flash card(s) with attributes title and content for the following prompt(Ensure you follow the number of cards that should be created).\n"
                message += f"Make it as concise as possible.\n\nprompt: {query}"

            jsonNotCorrect =True
            tries = 1
            while jsonNotCorrect:
                if tries > 5:
                    return Response({"error": "Could not generate flashcard(s)"}, status=500)
                if aiSpace == "Ollama":
                    response = chat(model=modelName, 
                        messages=messagesUser + [{"role": "user", "content": message}],
                        format=FlashCardsList.model_json_schema()) #gives the schema of the response in JSON format.
                else:
                    print("AI Space: ", aiSpace)
                    print("API Key: ", AISpace.objects.get(id=1).api_key)
                    client = OpenAI(
                      base_url = AISpace.objects.get(id=1).base_url,
                      api_key = AISpace.objects.get(id=1).api_key
                    )
                    response = client.chat.completions.create(
                      model=AISpace.objects.get(id=1).model_name,
                      messages=[{"role":"system","content":f"You are an AI assistant that creates flashcard(s) and respond only in VALID JSON. \
                                Here is the format of the JSON: {FlashCardsList.model_json_schema()}"}] +  messagesUser[1:][-5 if len(messagesUser) > 5 else 0:] +
                                [{"role": "user", "content": message}],
                    #   temperature=0.6,
                    #   top_p=0.7,
                    #   max_tokens=4096,
                    #   stream=True
                    )

                    response = response.choices[0].message.content.strip()
                    response = {"message": {"content": response}}

                tries += 1
                jsonNotCorrect = not is_json_valid(FlashCardsList, response["message"]["content"])
                print("JSON not correct: ", jsonNotCorrect)




            type(response["message"]["content"]) == str
            # print(response["message"]["content"])
            Cards = FlashCardsList.model_validate_json(response["message"]["content"])# Validates if the string follows the model schema then returns a FlashCardsList model, if not raises an exception
            result = []
            i = 0
            for card in Cards.cards:
                if FlashCards.objects.filter(thread=thread, title=card.title).exists() or i >= number:
                    continue
                flash = FlashCards.objects.create(thread=thread, title=card.title, content=card.content)
                # print(card.title, card.content)
                result.append({"title": card.title, "content": card.content})
                i += 1
            return Response({"cards": result}, status=200)
        except openai.APIError as e:
            return Response({"message": e.message}, status=400)
        except openai.OpenAIError as e:
            # Fallback safety net for any obscure SDK-internal errors
            return Response({"message": e.message}, status=400)
        except openai.APIConnectionError as e:
            # Catches network dropouts, SSL errors, and connection timeouts
            return Response({"message": e.message}, status=400)
        except Exception as e:
            return Response({"message": str(e)}, status=400)
    
class CreateQuizView(APIView):
    def post(self, request):
        try: 
            thread = Thread.objects.get(title=request.data.get("thread"))
            
            messagesUser = Message.objects.filter(thread=thread).order_by("created_at")
            number = int(request.data.get("number"))
            messagesUser = [{"role": msg.role, "content": msg.instructions if msg.role == "user" else msg.content} for msg in messagesUser]
            modelName = request.data.get("model")
            query = request.data.get("query")
            inputType = request.data.get("inputType")
            aiSpace = AISpace.objects.get(id=1).ai_space
            
            if inputType == "file" or inputType == "url": #If the input type is file or url, then we need to query the vector store first
                results = query_vectorstore(query)
                results = [chunk.page_content for chunk in results] #We dont have to include the metadata
            elif inputType == "web search":
                docResults = get_web_documents(query)
                if docResults == "404":
                    return Response({"error": "SearXNG container is not running"}, status=404)
                results = [chunk.page_content for chunk in docResults]
            elif inputType == "Kiwix":
                docResults = get_kiwix_documents(query)
                results = [chunk.page_content for chunk in docResults]
            if inputType != "model":
                message = f"""Create a multiple choice questions with {number} quesition(s) and 4 choices for each question based on the following prompt and content, where 1 choice is the correct answer.\n
                            Format: List choices in alphabetical list.\n\n 
                            prompt: {query}\n
                            Content: {results}"""
            else:
                message = f"""Create a multiple choice questions with {number} quesition(s) and 4 choices for each question based on the following prompt, where 1 choice is the correct answer.\n
                            Format: List choices in alphabetical list.\n\n 
                            prompt: {query}"""
                
            jsonNotCorrect =True
            tries = 1
            while jsonNotCorrect:
                if tries == 6:
                    return Response({"error": "Failed to generate questions"}, status=500)
                if aiSpace == "Ollama":
                    response = chat(model=modelName,
                        messages=messagesUser + [{"role": "user", "content": message}],
                        format=QuizCards.model_json_schema()) # gives the schema of the response in JSON format.
                else:
                    client = OpenAI(
                      base_url = AISpace.objects.get(id=1).base_url,
                      api_key = AISpace.objects.get(id=1).api_key
                    )
                    response = client.chat.completions.create(
                      model=AISpace.objects.get(id=1).model_name,
                      messages=[{"role":"system","content":f"You are an AI assistant that creates question(s) and respond only in VALID JSON. \
                                Here is the format of the JSON: {QuizCards.model_json_schema()}"}] + messagesUser[1:][-5 if len(messagesUser) > 5 else 0:] +
                                [{"role": "user", "content": message}],
                    #   temperature=0.6,
                    #   top_p=0.7,
                    #   max_tokens=4096,
                    #   stream=True
                    )

                    response = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
                    response = {"message": {"content": response}}
                tries += 1
                jsonNotCorrect = not is_json_valid(QuizCards, response["message"]["content"])
            #type(response["message"]["content"]) == str
            QuizCardsInstance = QuizCards.model_validate_json(response["message"]["content"]) # Validates if the string follows the model schema then returns a QuizCards model, if not raises an exception
            result = []
            i = 0
            for card in QuizCardsInstance.questions:
                if Quizzes.objects.filter(thread=thread, question=card.question).exists() or i >= number:
                    continue
                choicesNew = card.choices
                # print()
                if card.answer not in choicesNew:
                    choicesNew.append(card.answer)
                choicesNew = str(choicesNew)
                quiz = Quizzes.objects.create(thread=thread, question=card.question.strip(), answer=card.answer.strip(), choices=choicesNew.strip())
                # print(card.question, card.answer)
                choicesNew = ast.literal_eval(choicesNew.strip())
                random.shuffle(choicesNew)
                result.append({"question": card.question.strip(), "answer": card.answer.strip(), "choices": choicesNew})
                i += 1
            return Response({"quizzes": result}, status=200)
        except openai.APIError as e:
            return Response({"message": e.message}, status=400)
        except openai.OpenAIError as e:
            # Fallback safety net for any obscure SDK-internal errors
            return Response({"message": e.message}, status=400)
        except openai.APIConnectionError as e:
            # Catches network dropouts, SSL errors, and connection timeouts
            return Response({"message": e.message}, status=400)
        except Exception as e:
            print(e)
            return Response({"message": "Error creating quiz"}, status=400)
        
        
    


###############THREAD FUNCS##############
class CreateNewThreadView(APIView):
    def post(self, request):
        if Thread.objects.filter(title=request.data.get("title")).exists():
            return Response({"message": "Thread already exists"}, status=400)
        title = request.data.get("title")
        thread = Thread.objects.create(title=title)
        message = Message.objects.create(thread=thread, role="system", content="You are a helpful assistant that will provide answers to any question the user asks. Your name is 'May'")
        # print(thread)
        return Response({"id": thread.id}, status=200)
    
class GetAllThreadView(APIView):
    def get(self, request):
        threads = Thread.objects.all()
        # print(threads)
        return Response({"threads": [{"title": thread.title, "id": thread.id} for thread in threads]}, status=200)

class DeleteThreadView(APIView):
    def post(self, request):
        thread = Thread.objects.get(id=request.data.get("id"))
        thread.delete()
        return Response({"message": "Thread deleted"}, status=200)
    
####################FLASHCARD FUNCS################
class GetAllFlashCardsView(APIView):
    def get(self, request):
        thread = request.GET.get("thread")
        thread = Thread.objects.get(title=thread)
        cards = FlashCards.objects.filter(thread=thread)
        result = []
        for card in cards:
            result.append({"title": card.title, "content": card.content, "id": card.id})
        return Response({"cards": result}, status=200)
class DeleteFlashCardView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        flashcard = FlashCards.objects.get(thread=thread, title=request.data.get("title"), content=request.data.get("contentCard"), id=request.data.get("id"))
        flashcard.delete()
        return Response({"message": "Flashcard deleted"}, status=200)
    

class ModifyFlashCardView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        flashcard = FlashCards.objects.get(thread=thread, title=request.data.get("oldTitle"), id=request.data.get("id"))
        flashcard.title = request.data.get("title")
        flashcard.content = request.data.get("content")
        flashcard.save()
        return Response({"message": "Flashcard modified"}, status=200)

class CreateManualFlashCardView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        flashcard = FlashCards.objects.create(thread=thread, title=request.data.get("title"), content=request.data.get("content"))
        return Response({"message": "Flashcard created"}, status=200)
    
####################QUIZ FUNCS################
    
class GetAllQuizzesView(APIView):
    def get(self, request):
        thread = request.GET.get("thread")
        thread = Thread.objects.get(title=thread)
        cards = Quizzes.objects.filter(thread=thread)
        result = []
        for card in cards:
            choices = ast.literal_eval(card.choices)
            random.shuffle(choices)
            result.append({"question": card.question, "answer": card.answer, "choices": choices, "id": card.id})
        return Response({"quizzes": result}, status=200)
    
class DeleteQuizView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        quiz = Quizzes.objects.get(thread=thread, question=request.data.get("question"), id=request.data.get("id"))
        quiz.delete()
        return Response({"message": "Quiz deleted"}, status=200)
    
class ModifyQuizView(APIView):
    def post(self, request):

        thread = Thread.objects.get(title=request.data.get("thread"))
        quiz = Quizzes.objects.get(thread=thread, question=request.data.get("question"), id=request.data.get("id"))
        print(request.data.get("answer"))
        quiz.question = request.data.get("question")
        quiz.answer = request.data.get("answer")
        quiz.choices = str(request.data.get("choices")).strip()
        quiz.save()
        return Response({"message": "Quiz modified"}, status=200)
class DeleteQuizChoiceView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        quiz = Quizzes.objects.get(thread=thread, question=request.data.get("question"))
        answer = quiz.answer
        if(answer not in request.data.get("choices")):
            quiz.answer = ''
        quiz.choices = str(request.data.get("choices")).strip()
        quiz.save()
        return Response({"message": "Choice deleted"}, status=200)
    
    
class CreateManualQuizView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        quiz = Quizzes.objects.create(thread=thread, question=request.data.get("question"), answer=request.data.get("answer"), choices=str(request.data.get("choices")).strip())
        return Response({"message": "Quiz created"}, status=200)


#####################MESSAGE funcs
class GetAllMessagesView(APIView):
    def get(self, request):
        thread = request.GET.get("thread")
        # print(thread)
        thread = Thread.objects.get(title=thread)
        messages = Message.objects.filter(thread=thread).order_by("created_at")
        messages = messages[1:]
        messages = [{"role": msg.role, "content": msg.content, "id": msg.id} if msg.role == "assistant" else {"role": msg.role, "content": msg.content, "document": msg.document, "id": msg.id} for msg in messages]
        return Response({"messages": messages}, status=200)
    
class DeleteMessageView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        queries = Message.objects.filter(thread=thread, content=request.data.get("content"), role="user", document=request.data.get("document"), id=request.data.get("id"))
        if len(queries) == 0:
            return Response({"message": "Message not found"}, status=404)
        responses = Message.objects.filter(thread=thread, role="assistant", content=request.data.get("response"))
        if len(responses) == 0:
            return Response({"message": "Response not found"}, status=404)
        for query in queries:
            for response in responses:
                if response.id == query.id+1 and response.role == "assistant":
                    query.delete()
                    response.delete()
                    break
         
        return Response({"message": "Message deleted"}, status=200)
    
class DeleteAllMessagesView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        allMessages = Message.objects.filter(thread=thread).order_by("created_at")
        allMessages = allMessages[1:]
        for message in allMessages:
            message.delete()
        return Response({"message": "All messages deleted"}, status=200)
    

    
def ModifyMessageView(request):
    thread = Thread.objects.get(title=request.GET.get("thread"))
    time = request.GET.get("t")
    executionType = request.GET.get("executionType")
    queries = Message.objects.filter(thread=thread, content=request.GET.get("oldQuestion"), role="user", document=request.GET.get("oldDocument"))
    responses = Message.objects.filter(thread=thread, role="assistant", content=request.GET.get("oldResponse"))
    messages = Message.objects.filter(thread=thread).order_by("created_at")
    modelName = request.GET.get("model")
    oldDocument = request.GET.get("oldDocument")
    message = request.GET.get("query")
    messages = messages[1:]
    setting = AISpace.objects.get(id=1)

    topP = setting.top_p
    temperature = setting.temperature
    maxTokens = setting.max_tokens
    baseUrl = setting.base_url
    modelNameOnline = setting.model_name
    apiKey = setting.api_key

    aiSpace = setting.ai_space




    if executionType == "Web Search" or executionType == "Kiwix": #Check if docker is running for these execution types. If not started return proper error
        try:
            docker.from_env()
        except:
            def error_stream():
                yield "data: {\"error\": \"Docker is not running\"}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingHttpResponse(error_stream(), content_type="text/event-stream")
    
    # theQuery = None
    # theResponse = None
    print("This is the old document: ", oldDocument)
    print("# queries: ", len(queries), request.GET.get("oldQuestion"), request.GET.get("oldDocument"))
    print("# responses: ", len(responses))
    for query in queries:
            for response in responses:
                if response.id == query.id+1 and response.role == "assistant":
                    theQuery = query
                    theResponse = response
                    break
    messagesUser = [{"role": msg.role, "content": msg.instructions if msg.role == "user" else msg.content} for msg in messages if msg.created_at < theQuery.created_at]
    results = []


    if(executionType == "document"):
        print(executionType)
        results = query_vectorstore2(message)
        # results = []
        results = [chunk.page_content for chunk in results] #We dont have to include the metadata
        # print("Able to query temp vector store 2: ")
    elif(executionType == "Kiwix"):
        print(executionType)
        docResults = get_kiwix_documents(message)
        results = [chunk.page_content for chunk in docResults]
    elif(executionType == "Web Search"):
        print(executionType)
        docResults = get_web_documents(message)
        if docResults == "404":
            def error_stream():
                yield "data: {\"error\": \"SearXNG container is not running\"}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingHttpResponse(error_stream(), content_type="text/event-stream")
        results = [chunk.page_content for chunk in docResults]


    def event_stream():
        finalResponse = ""
        thinking = True
        if(executionType != "Explain Simply"):
            message = f"Read the following prompt and content carefully. Provide a comprehensive, detailed, and well-structured response to the prompt, directly utilizing the supplied content for support and context. Clearly explain your reasoning and organize your answer with appropriate headings, bullet points, or lists as needed for readability. If any aspect is unclear, state your assumptions. Try not to reference prior conversations—focus only on the information provided. The provided content might be not directly related to the prompt.\n\nPrompt:{request.GET.get("query")}\nContent:{results}"
        else:
            message = f"Read the following prompt carefully. Provide a comprehensive, detailed and well-structured response to the prompt using your knowledge.\n\n Prompt:{request.GET.get("query")}"
        print(f"new message: {theQuery.content}")
        if aiSpace == "Ollama":
            optionToSend = {}
            if not temperature:
                optionToSend["temperature"] = temperature
            if not topP:
                optionToSend["top_p"] = topP
            if not maxTokens:
                optionToSend["max_tokens"] = maxTokens

            stream = chat(model=modelName, 
                messages=messagesUser + [{"role": "user", "content": message}],
                options=optionToSend,
                stream=True)
        else:
            client = OpenAI(
              base_url = baseUrl,
              api_key = apiKey
            )
            try:
                if not isNewModel(client, modelNameOnline):
                    stream = client.chat.completions.create(model=modelNameOnline, 
                        messages=messagesUser + [{"role": "user", "content": message}],
                        temperature=float(temperature) if temperature else 0.7,
                        top_p=float(topP) if topP  else 1.0,
                        max_tokens=int(maxTokens) if maxTokens else 4096,
                        stream=True)
                else:
                    stream = client.chat.completions.create(model=modelNameOnline, 
                        messages=messagesUser + [{"role": "user", "content": message}],
                        temperature=float(temperature) if temperature else 0.7,
                        top_p=float(topP) if topP  else 1.0,
                        max_completion_tokens=int(maxTokens) if maxTokens else 4096,
                        stream=True)
            except openai.APIError as e:
                yield f"data: {{\"error\": \"{e.message}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return
            except openai.APIConnectionError as e:
                yield f"data: {{\"error\": \"Connection failed: {e.message}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return
            except openai.OpenAIError as e:
                yield f"data: {{\"error\": \"{e.message}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"
                yield "data: [DONE]\n\n"
                return

            
        
            
        thinkingProcessor = ""
        for chunk in stream:
            content = ""
            if aiSpace == "Ollama":
                content = chunk["message"]["content"]
            else:
                if chunk.choices and chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
            if finalResponse == "" and thinking:
                thinkingProcessor += content
                if len(thinkingProcessor.strip()) >= 7 and thinkingProcessor.strip()[:7].lower() != "<think>":
                    print(f"THINKING: {thinking}")
                    thinking = False
                    finalResponse += thinkingProcessor
                    lines = thinkingProcessor.split("\n")
                    for line in lines:
                        yield f"data: {line}\n"
                    yield "\n"  # end of event
                    continue
                if "</think>" in thinkingProcessor.lower():
                    thinking = False
                    print(f"THINKING: {thinking}")
                    toSend = thinkingProcessor.lower().split("</think>")[-1]
                    if len(toSend) > 0:
                        finalResponse += toSend
                        lines = toSend.split("\n")
                        for line in lines:
                            yield f"data: {line}\n"
                        yield "\n"  # end of event
                    continue
            if thinking == False:
                finalResponse += content
                lines = content.split("\n")
                for line in lines:
                    yield f"data: {line}\n"
                yield "\n"  # end of event


        # for chunk in stream:
        #     content = chunk["message"]["content"]
        #     # content = content.replace("\n", "<br>")
        #     finalResponse += content
        #     # print(finalResponse)
        #     yield f"data: {content}\n\n"
        if executionType == "Kiwix" or executionType == "Web Search":
            document = {doc.metadata["source"] for doc in docResults}
            nameOfDocument = ", ".join(document)
        elif executionType == "document":
            nameOfDocument = request.GET.get("newDocument")
        elif executionType == "Explain Simply":
            nameOfDocument = "Explain Simply"
        theQuery.content = request.GET.get("query")
        theQuery.instructions = message
        theQuery.document = nameOfDocument
        theQuery.save()
        theResponse.content = finalResponse
        theResponse.save()
        print("Done")
        yield "data: [DONE]\n\n"
    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    return response

class ModifyMessageManualView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        time = request.data.get("t")
        queries = Message.objects.filter(thread=thread, content=request.data.get("oldQuestion"), role="user", document=request.data.get("oldDocument"))
        responses = Message.objects.filter(thread=thread, role="assistant", content=request.data.get("oldResponse"))
        messages = Message.objects.filter(thread=thread).order_by("created_at")
        # modelName = request.data.get("model")
        # oldDocument = request.data.get("oldDocument")
        message = request.data.get("query")
        messages = messages[1:]
        # theQuery = None
        # theResponse = None
        print("# queries: ", len(queries), request.data.get("oldQuestion"), request.data.get("oldDocument"))
        print("# responses: ", len(responses))
        for query in queries:
                for response in responses:
                    if response.id == query.id+1 and response.role == "assistant":
                        query.content = request.data.get("query")
                        query.document = request.data.get("newDocument")
                        query.instructions = request.data.get("query")
                        print(request.data.get("newDocument"))
                        query.save()
                        response.content = request.data.get("newResponse")
                        response.save()
                        break
        return Response({"message": "Message modified"}, status=200)    
    

class ModifyAISpaceView(APIView):
    def post(self, request):
        try:
            print(request.data)
            aiSetting = AISpace.objects.first()
            print(AISpace)
            apiKey = request.data.get("apiKey")
            topP = request.data.get("topP")
            temperature = request.data.get("temperature")
            maxTokens = request.data.get("maxTokens")
            modelName = request.data.get("modelName")
            base_url = request.data.get("baseUrl")

            aiSpace = request.data.get("aiSpace")
            aiSetting.api_key = apiKey
            aiSetting.top_p = topP
            aiSetting.temperature = temperature
            aiSetting.max_tokens = maxTokens
            aiSetting.ai_space = aiSpace
            aiSetting.model_name = modelName
            aiSetting.base_url = base_url
            aiSetting.save()
            toReturn = {"apiKey": apiKey, "topP": topP, "temperature": temperature, "maxTokens": maxTokens, "aiSpace": aiSpace, "modelName": modelName, "baseUrl": base_url}
            
            return Response({"message": toReturn}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
class GetAISpaceView(APIView):
    def get(self, request):
        try:
            # aiSetting = AISpace.objects.first()
            aiSetting = get_ai_space()
            # print(aiSetting.api_key, aiSetting.top_p, aiSetting.temperature, aiSetting.max_tokens, aiSetting.aiSpace)
            # print("apiKey: ", aiSetting.api_key)
            # print("topP: ", aiSetting.top_p)
            # print("temperature: ", aiSetting.temperature)
            # print("maxTokens: ", aiSetting.max_tokens)
            # print("aiSpace: ", aiSetting.aiSpace)
            toReturn = {"apiKey": aiSetting.api_key, "topP": aiSetting.top_p, "temperature": aiSetting.temperature, "maxTokens": aiSetting.max_tokens,
                        "aiSpace": aiSetting.ai_space, "modelName": aiSetting.model_name, "baseUrl": aiSetting.base_url}
            return Response({"message": toReturn}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
    
########################Other views
class GetTextView(APIView):
    def post(self, request):
        # print(request.data["rat"])
        """
        Given a file or a YouTube URL, upload the file and extract its text or fetch the YouTube video's transcript, and store it in the global vectorStore variable.

        Args:
            request (Request): a Django request object

        Returns:
            Response: a Django response object with a JSON containing an error message if there is an error or a success message if there is no error.

        Raises:
            Exception: if there is an error with the file upload or YouTube video fetching
        """
        
        if request.data.get("modifyMsg") == "true":
            global tempVectorStore
            print("!!!tempVectorStore!!!")
        else:
            global vectorStore

        try:
            url = request.data.get("url")
            file = request.FILES.get("file")
            global documentName
            saved_path = None
            if file:
                file_path = os.path.join("uploads", file.name)
                saved_path = default_storage.save(file_path, ContentFile(file.read()))
                text = fileExtractor(saved_path)
                text = '\n'.join(text.split('\n\n'))
                # print(saved_path)
                # print(text)
                default_storage.delete(saved_path)
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50
                )
                docs = [Document(page_content=chunk, metadata={"title": file.name, "source": file.name}) for chunk in text_splitter.split_text(text)]
                if request.data.get("modifyMsg") == "true":
                    tempVectorStore = FAISS.from_documents(docs, embedding_model)
                else:
                    vectorStore = FAISS.from_documents(docs, embedding_model)
                documentName = file.name
            
            elif url:
                if not ("youtu.be" in url.lower()):
                    if not ("youtube.com" in url.lower()):
                        return Response({"error": "Invalid URL"}, status=400)
                video_id_str = get_youtube_video_id(url)

                ##############OLD################
                # transcript = YouTubeTranscriptApi.get_transcript(video_id)
                # text = "\n".join([i['text'].strip() for i in transcript])

                fetched_transcript = YouTubeTranscriptApi().fetch(video_id=video_id_str)
                # print(len(fetched_transcript))
                text = ""
                for snippet in fetched_transcript:
                    text += f"{snippet.text}\n"
                # print(f"Transcript: {text[:500]}")  # Check first 500 characters for issues
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50
                )
                docs = [Document(page_content=chunk, metadata={"title": url, "source": url}) for chunk in text_splitter.split_text(text)]
                if request.data.get("modifyMsg") == "true":
                    tempVectorStore = FAISS.from_documents(docs, embedding_model)
                else:
                    vectorStore = FAISS.from_documents(docs, embedding_model)
                documentName = url #No need to worry about '&' bcuz of POST method
            
            return Response({"msg": "This is a test"}, status=200)
        except Exception as e:
            if saved_path: default_storage.delete(saved_path)
            print(e)
            return Response({"error": str(e)}, status=500)

class UploadFolderView(APIView):
    def get(self, request):
        result = subprocess.run(
            ["python", "api/folderUpload.py"],
            capture_output=True,
            text=True
        )
        volumeName = ""
        
        # Check if subprocess succeeded
        if result.returncode == 0:
            # Process completed successfully
            try:
                client = docker.from_env()
            except Exception as e:
                print(e)
                return Response({"error": "Docker is not running"}, status=500)
            global kiwixContainer 
            kiwixContainerList = client.containers.list(all=True, filters={'ancestor': 'ghcr.io/kiwix/kiwix-serve:3.7.0'})
            print("Kiwix container list total:", len(kiwixContainerList))

            if len(kiwixContainerList) > 0:
                # kiwixContainer = kiwixContainerList[0]
                for tempContainer in kiwixContainerList:
                    
                    if tempContainer.status == 'running':
                        kiwixContainer = tempContainer
                        print("Kiwix container alrtemprunning")
                        volumeName = kiwixContainer.attrs['Mounts'][0]['Source']
                        print(volumeName)
                        while kiwix_search("Roman") is None:
                            pass
                        return Response({"folderPath": volumeName, "message": "Already running"}, status=200)
                    else:
                        print("Kiwix container found but not running, removing it")
                        tempContainer.remove()
                        tempContainer = None
            for container in kiwixContainerList:
                if container.status == 'exited':
                    container.remove()
            
            try:    
                
                # global kiwixContainer 
                if kiwixContainer is not None:
                    # if kiwixContainer.status == 'running':
                        # kiwixContainer.stop()
                    if kiwixContainer.status == 'exited':
                        kiwixContainer.remove()
                        kiwixContainer = None   
                        volumeName = result.stdout.strip()
                        # print(volumeName)
                        kiwixContainer = client.containers.run(
                            "ghcr.io/kiwix/kiwix-serve:3.7.0", "*.zim",
                            ports={'8080/tcp': 9222}, volumes={volumeName: {'bind': '/data', 'mode': 'rw'}},
                            detach=True
                        )
                elif kiwixContainer is None:
                    volumeName = result.stdout.strip()
                    # print(volumeName)
                    kiwixContainer = client.containers.run(
                        "ghcr.io/kiwix/kiwix-serve:3.7.0", "*.zim",
                        ports={'8080/tcp': 9222}, volumes={volumeName: {'bind': '/data', 'mode': 'rw'}},
                        detach=True
                    )

                # time.sleep(2)

                kiwixContainer.reload()
                print(kiwixContainer.status)
                if kiwixContainer.status == 'exited':
                    kiwixContainer.remove()
                    kiwixContainer = None
                    return Response({"error": "Kiwix container exited"}, status=500)
                # response = requests.get("http://localhost:9222/search", params={"pattern": "America", "format": "xml", "start": 0, "pageLength": 25})
                # while response.status_code != 200:
                    # response = requests.get("http://localhost:9222/search", params={"pattern": "America", "format": "xml", "start": 0, "pageLength": 25})
                    # time.sleep(1)
                while kiwix_search("America") is None:
                    pass
                return Response({"folderPath":  volumeName}, status=200)
            except:
                # global kiwixContainer
                if kiwixContainer is not None:
                    if kiwixContainer.status == 'exited':
                        kiwixContainer.stop()
                    kiwixContainer.remove()
                return Response({"error": "Failed to start Kiwix container"}, status=500)
        else:
            return Response({"error": result.stderr}, status=500)
class GetAllModels(APIView):
    def get(self, request):
        try:
            models = ollama.list()
            # for model in models.models:
            #     print(model.model)
            return Response({"models": [model.model for model in models.models]}, status=200)
        except Exception as e:
            print(e)
            return Response({"message": str(e)}, status=500)
        
class StopKiwixContainerView(APIView):
    def get(self, request):
        global kiwixContainer
        if kiwixContainer is None:
            return Response({"message": "Kiwix container is not running"}, status=200)
        kiwixContainer.stop()
        kiwixContainer.remove()
        kiwixContainer = None
        return Response({"message": "Kiwix container stopped"}, status=200)
    
class TodoListView(APIView):
    def get(self, request):
        todos = Todo.objects.all().order_by('-created_at')
        serializer = TodoSerializer(todos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TodoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class TodoDetailView(APIView):
    def get(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        serializer = TodoSerializer(todo)
        return Response(serializer.data)

    def patch(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        serializer = TodoSerializer(todo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        todo.delete()
        return Response(status=204)

class SaveMDFileView(APIView):
    def post(self, request):
        data = json.loads(request.body)
        content = data['content']
        filename = data.get('filename', 'document.html')

        save_path = os.path.join('brain1', filename if filename[-3:] == ".md" else filename + ".md") 
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return Response({"message": "File saved successfully"}, status=200)

class LoadMDFileView(APIView):
    def get(self, request):
        filename = request.GET.get('filename', 'document.html')
        # print("This is the request:", request.data)
        save_path = os.path.join('brain1', filename if filename[-3:] == ".md" else filename + ".md") 
        # print(save_path)
        with open(save_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # print("got here", save_path)
        return Response({"content": content}, status=200)



########################function tools

def query_vectorstore(query, topK=7):
    global vectorStore
    if vectorStore is not None:
        results = vectorStore.similarity_search(query, k=topK)
        # for doc in results:
        #     print(doc.page_content)
        return results
    else:
        print("No vector store 1")

def query_vectorstore2(query, topK=7):
    global tempVectorStore
    if tempVectorStore is not None:
        results = tempVectorStore.similarity_search(query, k=topK)
        # for doc in results:
        #     print(doc.page_content)
        # tempVectorStore = None
        return results
    else:
        print("No vector store 2")

    
def fileExtractor(file_path):
    server_url = "http://127.0.0.1:9998"
    parsed = parser.from_file(file_path, server_url)
    # print(parsed['content'])
    return parsed['content'].strip()


def get_youtube_video_id(url):
    if "youtu.be" in url:
        return url.split('/')[-1]
    elif "youtube.com" in url:
        query = urlparse(url).query
        return parse_qs(query).get("v", [None])[0]
    return None

def kiwix_search(query, host="http://localhost:9222"):
    try:
        r = requests.get(f"{host}/search", params={"pattern": query, "format": "xml", "start": 0, "pageLength": 25})
        # print(r.status_code)
        resultsBefore = xmltodict.parse(r.text)
        # print(resultsBefore)
        # print("Number of results:", len(resultsBefore["rss"]["channel"]["item"]))
        # print(json.dumps(resultsBefore, indent=4))
        results = [{"title": _["title"], "link": _["link"]} for _ in resultsBefore["rss"]["channel"]["item"]]
        # print(results)
        # return results

        # r = requests.get(f"{host}/search", params={"pattern": query, "format": "xml"})
        return results
    except:
        return None


def get_kiwix_documents(query):
    results = kiwix_search(query)
    counter = 0
    count = 0
    # print(results)
    if len(results) > 10:
        results = results[:10]
    for result in results:
        title = result['title']
        url = result['link']
        r = requests.get(f"http://localhost:9222{url}")
        newItem = BeautifulSoup(r.text, "html.parser")
        for tag in newItem(['script', 'style', 'nav', 'footer']):
                    tag.decompose()
        text = newItem.get_text(separator=' ')
        lines = [line.strip() for line in text.splitlines()]
        clean_text = '\n'.join(line for line in lines if line)
        clean_text = clean_text.lower()
        print(title, url)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        docs = []
        for chunk in text_splitter.split_text(clean_text):
            docs += [Document(page_content=chunk, metadata={"title": title, "source": url}, id=str(count))]
            count += 1
        if counter == 0:
            vectorstore = FAISS.from_documents(docs, embedding_model)
        else:
            vectorstore.add_documents(docs)
        counter += 1
        # Process, embed, chunk, or pass to LLM as context
    results = vectorstore.similarity_search(query=query, k=7)
    # results = [chunk.page_content for chunk in results]
    return results

def get_web_documents(query) -> list[Document] | str:
    try:
        results = requests.get("http://localhost:4141/search", params={"q": query, "format": "json"})
    except requests.exceptions.ConnectionError as e:
        print(e)
        return "404"
    # print("Status Code:", results.status_code)
    
    results = results.json()["results"]
    store = []
    counter = 0
    count = 0
    if len(results) > 5:
        results = results[:5]
    for item in results:
        try: 
            content = requests.get(item["url"], timeout=5)
            print(content)
            if content.status_code == 200:
                newItem = BeautifulSoup(content.text, "html.parser")
                for tag in newItem(['script', 'style', 'nav', 'footer']):
                    tag.decompose()
                text = newItem.get_text(separator=' ')
                lines = [line.strip() for line in text.splitlines()]
                clean_text = '\n'.join(line for line in lines if line)
                clean_text = clean_text.lower()
                store.append(clean_text)
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50
                )
                docs = []
                for chunk in text_splitter.split_text(clean_text):
                    docs += [Document(page_content=chunk, metadata={"title": item["title"], "source": item["url"]}, id=str(count))]
                    count += 1
                if counter == 0:
                    vectorstore = FAISS.from_documents(docs, embedding_model)
                else:
                    vectorstore.add_documents(docs)
                counter += 1
    
        except Exception as e:
            print(e)
    
    
    results = vectorstore.similarity_search(query=query, k=7)
    return results

def thinkingTextCheck(thinkingText, content):
    contentStripped = content.strip().lower()
    i = 1
    thinking = False
    while i < len(thinkingText) and thinking == False:
        if thinkingText[i] == contentStripped[i]:
            thinking = True
        i += 1
    return thinking

def notThinkingTextCheck(notThinkingText, content):
    contentStripped = content.strip().lower()
    contentNew = content.lower()
    i = 1
    notThinking = True
    while i < len(notThinkingText) and notThinking == True:
        if notThinkingText[i] != contentStripped[i]:
            notThinking = False
        i += 1
    return notThinking


def is_json_valid(modelToBeUsed,json_str: str) -> bool:
    try:
        # Attempts to parse and validate the JSON string
        modelToBeUsed.model_validate_json(json_str)
        return True
    except (ValidationError, ValueError):
        # Returns False if schema is wrong or JSON is malformed
        return False
    
def isNewModel(client, modelNameOnline):
    try:
        testChat = client.chat.completions.create(model=modelNameOnline, 
                messages=[{"role": "user", "content": "Say one word"}],
                temperature=0.7,
                top_p=1.0,
                max_tokens=4096)
                # stream=True)
        
        return False
    except:
        return True

