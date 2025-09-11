from django.urls import path, include
from .views import (GetTextView, GetAllModels, chatWithFile, CreateNewThreadView, GetAllThreadView, DeleteThreadView, CreateFlashCardsView, GetAllFlashCardsView
, DeleteFlashCardView, ModifyFlashCardView, CreateQuizView, GetAllQuizzesView, DeleteQuizView, ModifyQuizView, DeleteQuizChoiceView, CreateManualFlashCardView, CreateManualQuizView)
    
# from .views import index

urlpatterns = [
    path('fileUpload/', GetTextView.as_view()),
    # path('chat/', ChatAIView.as_view()),
    path('models/', GetAllModels.as_view()),
    path('chatStream/', chatWithFile, name="chat_stream"),
    path('createThread/', CreateNewThreadView.as_view()),
    path('getThreads/', GetAllThreadView.as_view()),
    path('deleteThread/', DeleteThreadView.as_view()),
    path('createFlashCards/', CreateFlashCardsView.as_view()),
    path('getFlashCards/', GetAllFlashCardsView.as_view()),
    path('deleteFlashCard/', DeleteFlashCardView.as_view()),
    path('modifyFlashCard/', ModifyFlashCardView.as_view()),
    path('createQuiz/', CreateQuizView.as_view()),
    path('getQuizzes/', GetAllQuizzesView.as_view()),
    path('deleteQuiz/', DeleteQuizView.as_view()),
    path('modifyQuizCard/', ModifyQuizView.as_view()),
    path('deleteChoiceQuiz/', DeleteQuizChoiceView.as_view()),
    path('createManualFlashCard/', CreateManualFlashCardView.as_view()),
    path('createManualQuiz/', CreateManualQuizView.as_view()),
]