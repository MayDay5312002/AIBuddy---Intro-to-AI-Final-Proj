from django.urls import path, include
from .views import GetTextView, QueryView
# from .views import index

urlpatterns = [
    path('fileUpload/', GetTextView.as_view()),
    path('query/', QueryView.as_view()),
]