from django.urls import path, include
from .views import GetTextView, ChatAIView, GetAllModels, chatWithFile
# from .views import index

urlpatterns = [
    path('fileUpload/', GetTextView.as_view()),
    path('chat/', ChatAIView.as_view()),
    path('models/', GetAllModels.as_view()),
    path('chatStream/', chatWithFile, name="chat_stream"),
]