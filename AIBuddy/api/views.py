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
# from langchain.vectorstores import FAISS
# from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
# from langchain_huggingface import HuggingFaceEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
# from sentence_transformers import SentenceTransformer

from langchain.docstore.document import Document

from ollama import chat
import ollama, docker, requests
from pydantic import BaseModel

from AIBuddy.models import *

import ast, random, json, xmltodict
import subprocess, time

# EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name="./models/all-MiniLM-L6-v2")


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
        results = [chunk.page_content for chunk in docResults]
    # finalResponse = ""
    def event_stream(results = results):
        global vectorStore
        thinking = False
        # query = request.GET.get("query")
        # modelName = request.GET.get("model")
        # results = query_vectorstore(query)
        finalResponse = ""
        if(executionType != "Explain Simply"):
            message = f"Read the following prompt and content carefully. Provide a comprehensive, detailed, and well-structured response to the prompt, directly utilizing the supplied content for support and context. Clearly explain your reasoning and organize your answer with appropriate headings, bullet points, or lists as needed for readability. If any aspect is unclear, state your assumptions. Try not to reference prior conversations—focus only on the information provided. The provided content might be not directly related to the prompt.\n\nPrompt:{query}\nContent:{results}"
        else:
            message = f"Read the following prompt carefully. Provide a comprehensive, detailed and well-structured response to the prompt using your knowledge.\n\n Prompt:{query}"
        print(message)
        stream = chat(model=modelName, 
            messages=messagesUser + [{"role": "user", "content": message}],
            stream=True)
        for chunk in stream:
            content = chunk["message"]["content"]
            if content.lower() == "<think>":
                thinking = True
            elif content.lower() == "</think>":
                thinking = False
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
        query = request.data.get("query")
        modelName = request.data.get("model")
        thread = request.data.get("thread")
        number = int(request.data.get("number"))
        inputType = request.data.get("inputType")
        # print("Thead: ", thread)
        thread = Thread.objects.get(title=thread)
        messagesUser = Message.objects.filter(thread=thread).order_by("created_at")
        messagesUser = [{"role": msg.role, "content": msg.instructions if msg.role == "user" else msg.content} for msg in messagesUser]
        if inputType == "file" or inputType == "url": #If the input type is file or url, then we need to query the vector store first
            results = query_vectorstore(query)
            results = [chunk.page_content for chunk in results] #We dont have to include the metadata
        elif inputType == "web search":
            docResults = get_web_documents(query)
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
        response = chat(model=modelName, 
            messages=messagesUser + [{"role": "user", "content": message}],
            format=FlashCardsList.model_json_schema()) #gives the schema of the response in JSON format.
        #type(response["message"]["content"]) == str
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
            if inputType == "file" or inputType == "url": #If the input type is file or url, then we need to query the vector store first
                results = query_vectorstore(query)
                results = [chunk.page_content for chunk in results] #We dont have to include the metadata
            elif inputType == "web search":
                docResults = get_web_documents(query)
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
            response = chat(model=modelName,
                messages=messagesUser + [{"role": "user", "content": message}],
                format=QuizCards.model_json_schema()) # gives the schema of the response in JSON format.
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
        return Response({"message": thread.id}, status=200)
    
class GetAllThreadView(APIView):
    def get(self, request):
        threads = Thread.objects.all()
        return Response({"threads": [thread.title for thread in threads]}, status=200)

class DeleteThreadView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("title"))
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
        results = [chunk.page_content for chunk in docResults]


    def event_stream():
        finalResponse = ""
        thinking = False
        if(executionType != "Explain Simply"):
            message = f"Read the following prompt and content carefully. Provide a comprehensive, detailed, and well-structured response to the prompt, directly utilizing the supplied content for support and context. Clearly explain your reasoning and organize your answer with appropriate headings, bullet points, or lists as needed for readability. If any aspect is unclear, state your assumptions. Try not to reference prior conversations—focus only on the information provided. The provided content might be not directly related to the prompt.\n\nPrompt:{theQuery.content}\nContent:{results}"
        else:
            message = f"Read the following prompt carefully. Provide a comprehensive, detailed and well-structured response to the prompt using your knowledge.\n\n Prompt:{theQuery.content}"
        stream = chat(model=modelName, 
            messages=messagesUser + [{"role": "user", "content": message}],
            stream=True)
        
        for chunk in stream:
            content = chunk["message"]["content"]
            if content.lower() == "<think>":
                thinking = True
            elif content.lower() == "</think>":
                thinking = False
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
                        query.save()
                        response.content = request.data.get("newResponse")
                        response.save()
                        break
        return Response({"message": "Message modified"}, status=200)    
    
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
            default_storage.delete(saved_path)
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
                kiwixContainer = kiwixContainerList[0]
                if kiwixContainer.status == 'running':
                    print("Kiwix container already running")
                    volumeName = kiwixContainer.attrs['Mounts'][0]['Source']
                    print(volumeName)
                else:
                    print("Kiwix container found but not running, removing it")
                    kiwixContainer.remove()
                    kiwixContainer = None
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
                        kiwixContainer = client.containers.run(
                            "ghcr.io/kiwix/kiwix-serve:3.7.0", "*.zim",
                            ports={'8080/tcp': 9222}, volumes={volumeName: {'bind': '/data', 'mode': 'rw'}},
                            detach=True
                        )
                if kiwixContainer is None:
                    volumeName = result.stdout.strip()
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
        models = ollama.list()
        # for model in models.models:
        #     print(model.model)
        return Response({"models": [model.model for model in models.models]}, status=200)
        
class StopKiwixContainerView(APIView):
    def get(self, request):
        global kiwixContainer
        if kiwixContainer is None:
            return Response({"message": "Kiwix container is not running"}, status=200)
        kiwixContainer.stop()
        kiwixContainer.remove()
        kiwixContainer = None
        return Response({"message": "Kiwix container stopped"}, status=200)


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
    parsed = parser.from_file(file_path)
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
    r = requests.get(f"{host}/search", params={"pattern": query, "format": "xml", "start": 0, "pageLength": 25})
    print(r.status_code)
    resultsBefore = xmltodict.parse(r.text)
    print(resultsBefore)
    print("Number of results:", len(resultsBefore["rss"]["channel"]["item"]))
    print(json.dumps(resultsBefore, indent=4))
    results = [{"title": _["title"], "link": _["link"]} for _ in resultsBefore["rss"]["channel"]["item"]]
    # print(results)
    # return results

    # r = requests.get(f"{host}/search", params={"pattern": query, "format": "xml"})
    return results


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

def get_web_documents(query):
    results = requests.get("http://localhost:4141/search", params={"q": query, "format": "json"})
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

