from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import StreamingHttpResponse

from tika import parser


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
import ollama
from pydantic import BaseModel

from AIBuddy.models import *

import ast, random

# EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name="./models/all-MiniLM-L6-v2")


import os
# Create your views here.


vectorStore = None



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
        global vectorStore
        try:
            url = request.data.get("url")
            file = request.FILES.get("file")
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
                docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(text)]
                vectorStore = FAISS.from_documents(docs, embedding_model)

            elif url:
                if not ("youtu.be" in url.lower()):
                    if not ("youtube.com" in url.lower()):
                        return Response({"error": "Invalid URL"}, status=400)
                video_id_str = get_youtube_video_id(url)

                ##############OLD################
                # transcript = YouTubeTranscriptApi.get_transcript(video_id)
                # text = "\n".join([i['text'].strip() for i in transcript])

                fetched_transcript = YouTubeTranscriptApi().fetch(video_id=video_id_str)
                print(len(fetched_transcript))
                text = ""
                for snippet in fetched_transcript:
                    text += f"{snippet.text}\n"
                print(f"Transcript: {text[:500]}")  # Check first 500 characters for issues
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50
                )
                docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(text)]
                vectorStore = FAISS.from_documents(docs, embedding_model)

            return Response({"msg": "This is a test"}, status=200)
        except Exception as e:
            default_storage.delete(saved_path)
            print(e)
            return Response({"error": str(e)}, status=500)
        
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
    # print("Thead: ", thread)
    thread = Thread.objects.get(title=thread)
    messagesUser = Message.objects.filter(thread=thread).order_by("created_at")
    messagesUser = [{"role": msg.role, "content": msg.content} for msg in messagesUser]
    results = query_vectorstore(query)
    results = [chunk.page_content for chunk in results] #We dont have to include the metadata
    # finalResponse = ""
    def event_stream():
        global vectorStore
        # query = request.GET.get("query")
        # modelName = request.GET.get("model")
        # results = query_vectorstore(query)
        finalResponse = ""
        message = f"Read the following prompt and content carefully. Provide a comprehensive, detailed, and well-structured response to the prompt, directly utilizing the supplied content for support and context. Clearly explain your reasoning and organize your answer with appropriate headings, bullet points, or lists as needed for readability. If any aspect is unclear, state your assumptions. Try not to reference prior conversations—focus only on the information provided.\n\nPrompt:{query}\nContent:{results}"
        print(message)
        stream = chat(model=modelName, 
            messages=messagesUser + [{"role": "user", "content": message}],
            stream=True)
        for chunk in stream:
            content = chunk["message"]["content"]
            content = content.replace("\n", "<br>")
            finalResponse += content
            # print(finalResponse)
            yield f"data: {content}\n\n"
        # print(finalResponse)
        Message.objects.create(thread=thread, role="user", content=query)
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
        # print("Thead: ", thread)
        thread = Thread.objects.get(title=thread)
        messagesUser = Message.objects.filter(thread=thread).order_by("created_at")
        messagesUser = [{"role": msg.role, "content": msg.content} for msg in messagesUser]
        results = query_vectorstore(query)
        results = [chunk.page_content for chunk in results] #We dont have to include the metadata
        message = f"Create {number} flash card(s) with attributes title and content for the following prompt and content(Ensure you follow the number of cards that should be created).\n"
        message += f"Make it as concise as possible.\n\nprompt: {query}\nContent: {results}"
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
            messagesUser = [{"role": msg.role, "content": msg.content} for msg in messagesUser]
            modelName = request.data.get("model")
            results = query_vectorstore(request.data.get("query"))
            results = [chunk.page_content for chunk in results] #We dont have to include the metadata
            message = f"""Create a multiple choice questions with {number} quesition(s) and 4 choices for each question based on the following content, where 1 choice is the correct answer.\n
                        Format: List choices in alphabetical list.\n\n 
                        prompt: {request.data.get("query")}\n
                        Content: {results}"""
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
        message = Message.objects.create(thread=thread, role="system", content="You are a helpful tutor that will respond in sentence and paragraph form.")
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
            result.append({"title": card.title, "content": card.content})
        return Response({"cards": result}, status=200)
class DeleteFlashCardView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        flashcard = FlashCards.objects.get(thread=thread, title=request.data.get("title"))
        flashcard.delete()
        return Response({"message": "Flashcard deleted"}, status=200)
    

class ModifyFlashCardView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        flashcard = FlashCards.objects.get(thread=thread, title=request.data.get("oldTitle"))
        flashcard.title = request.data.get("title")
        flashcard.content = request.data.get("content")
        flashcard.save()
        return Response({"message": "Flashcard modified"}, status=200)
    
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
            result.append({"question": card.question, "answer": card.answer, "choices": choices})
        return Response({"quizzes": result}, status=200)
    
class DeleteQuizView(APIView):
    def post(self, request):
        thread = Thread.objects.get(title=request.data.get("thread"))
        quiz = Quizzes.objects.get(thread=thread, question=request.data.get("question"))
        quiz.delete()
        return Response({"message": "Quiz deleted"}, status=200)
    
class ModifyQuizView(APIView):
    def post(self, request):

        thread = Thread.objects.get(title=request.data.get("thread"))
        quiz = Quizzes.objects.get(thread=thread, question=request.data.get("question"))
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
    




########################function tools

def query_vectorstore(query, topK=7):
    global vectorStore
    if vectorStore is not None:
        results = vectorStore.similarity_search(query, k=topK)
        # for doc in results:
        #     print(doc.page_content)
        return results
    else:
        print("No vector store")

    
def fileExtractor(file_path):
    parsed = parser.from_file(file_path)
    print(parsed['content'])
    return parsed['content'].strip()


def get_youtube_video_id(url):
    if "youtu.be" in url:
        return url.split('/')[-1]
    elif "youtube.com" in url:
        query = urlparse(url).query
        return parse_qs(query).get("v", [None])[0]
    return None

class GetAllModels(APIView):
    def get(self, request):
        models = ollama.list()
        # for model in models.models:
        #     print(model.model)
        return Response({"models": [model.model for model in models.models]}, status=200)
        # return Response({"msg": "This is a test"}, status=200)
