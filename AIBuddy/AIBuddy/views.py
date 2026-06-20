from django.shortcuts import render

from .services import get_ai_space

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, "frontend/index.html")




def my_view(request):

    ai_space = get_ai_space()

    print(ai_space.api_key)