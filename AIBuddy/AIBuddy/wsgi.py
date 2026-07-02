"""
WSGI config for AIBuddy project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
import time, requests
import signal
import sys
import subprocess
import docker

import django

#startup hook 
from .services import get_ai_space


django.setup()
print("AI Space: ", get_ai_space()) 

def start_compose(compose_file):
    subprocess.run(['docker', 'compose', '-f', compose_file, 'up', '-d'], check=True)

def stop_compose(compose_file):
    subprocess.run(['docker', 'compose', '-f', compose_file, 'down'], check=True)

def checkIfDockerRun(dockerClient):
    try:
        dockerClient = docker.from_env()
        dockerClient.version()
        print("Docker is running")
        return dockerClient
    except:
        print("Docker is not running")
        return None
    
def wait_for_tika(url="http://127.0.0.1:9998", timeout=30, interval=1):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(url + "/tika", timeout=2)
            if r.status_code == 200:
                print("Tika is ready")
                return True
        except Exception:
            pass
        time.sleep(interval)
    raise RuntimeError("Tika did not become ready in time")

def signal_handler(signum, frame): #Force cleanup
    # Cleanup code here
    stop_compose(r'docker-controller\docker-compose.yaml')
    listOfContainers = settingsClient.containers.list(all=True, filters={'ancestor': 'ghcr.io/kiwix/kiwix-serve:3.7.0'})
    for container in listOfContainers:
        if container.status == 'running':
            container.stop()
            container.remove()
        elif container.status == 'exited':
            container.remove()
    print("Signal received, cleaning up")
    sys.exit(0)

settingsClient = checkIfDockerRun(None)


if(settingsClient is not None):
    signal.signal(signal.SIGINT, signal_handler)  
    signal.signal(signal.SIGTERM, signal_handler) 
    start_compose(r'docker-controller\docker-compose.yaml')
    wait_for_tika()
    # start_compose(r'docker-controller\tika.yaml')
    listOfContainers = settingsClient.containers.list(all=True, filters={'ancestor': 'ghcr.io/kiwix/kiwix-serve:3.7.0'})
    for container in listOfContainers:
        if container.status == 'exited':
            container.remove()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AIBuddy.settings')

application = get_wsgi_application() #wsgi application
