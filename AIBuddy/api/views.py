from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
# Create your views here.

class index(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"message": "Hello, world!"}, status=200)