from .models import AISpace

def get_ai_space():
    ai_space, created = AISpace.objects.get_or_create(
        id=1,
        defaults={
            "api_key": "",
        }
    )

    return ai_space