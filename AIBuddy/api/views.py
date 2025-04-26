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

from langchain.docstore.document import Document

from ollama import chat
import ollama
from pydantic import BaseModel

EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
embedding_model = HuggingFaceEmbeddings(model_name=EMBED_MODEL_NAME)

import os
# Create your views here.

vectorStore = None



############Format Outputs#################
class Card(BaseModel):
  title_card: str
  Content: str

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
                print(text)
                default_storage.delete(saved_path)
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50
                )
                docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(text)]
                vectorStore = FAISS.from_documents(docs, embedding_model)

            elif url:
                video_id = get_youtube_video_id(url)
                transcript = YouTubeTranscriptApi.get_transcript(video_id)
                text = "\n".join([i['text'].strip() for i in transcript])
                print(text)
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
        
class ChatAIView(APIView):
    # global vectorStore
    def get(self, request):
        global vectorStore
        query = request.GET.get("query")
        modelName = request.GET.get("model")
        results = query_vectorstore(query)
        message = f"Answer this prompt: {query}\n\nContent: {results}"
        ollama.c
        response = chat(model=modelName, messages=[
            {"role": "system", "content": "You are a helpful tutor that will respond in sentence and paragraph form."},
            {"role": "user", "content": message}
            ])
        messegeResponse  = response['message']['content']
        return Response({"msg": messegeResponse}, status=200)
    

def chatWithFile(request):
    query = request.GET.get("query")
    modelName = request.GET.get("model")
    results = query_vectorstore(query)
    def event_stream():
        global vectorStore
        # query = request.GET.get("query")
        # modelName = request.GET.get("model")
        # results = query_vectorstore(query)
        message = f"Answer this prompt: {query}\n\nContent: {results}"
        stream = chat(model=modelName, messages=[
            # {"role": "control", "content": "thinking"},
            {"role": "system", "content": "You are a helpful tutor that will respond in sentence and paragraph form."},
            {"role": "user", "content": message}
            ],
            stream=True)
        for chunk in stream:
            content = chunk["message"]["content"]
            yield f"data: {content}\n\n" 
    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    return response
        
    

class GetAllModels(APIView):
    def get(self, request):
        models = ollama.list()
        # for model in models.models:
        #     print(model.model)
        return Response({"models": [model.model for model in models.models]}, status=200)
        # return Response({"msg": "This is a test"}, status=200)

    




# function tools

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
