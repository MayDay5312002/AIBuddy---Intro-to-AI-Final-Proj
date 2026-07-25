import atexit
import subprocess
import docker
import requests
import time

from django.apps import AppConfig
from django.conf import settings

class AIBuddyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'AIBuddy'

    def ready(self):
        # Only run in dev, not during migrations or collectstatic
        if settings.DEBUG:
            self._start_docker_services()

    def _start_docker_services(self):
        compose_file = r'docker-controller\docker-compose.yaml'

        try:
            client = docker.from_env()
            client.version()
        except Exception:
            print("Docker not running — skipping services")
            return

        subprocess.run(['docker', 'compose', '-f', compose_file, 'up', '-d'], check=True)
        self._wait_for_tika()

        # Cleanup on exit
        atexit.register(self._cleanup_docker, compose_file, client)

    def _wait_for_tika(self, url="http://127.0.0.1:9998", timeout=30):
        start = time.time()
        while time.time() - start < timeout:
            try:
                r = requests.get(url + "/tika", timeout=2)
                if r.status_code == 200:
                    print("Tika is ready")
                    return
            except Exception:
                pass
            time.sleep(1)
        print("Warning: Tika did not become ready")

    def _cleanup_docker(self, compose_file, client):
        subprocess.run(['docker', 'compose', '-f', compose_file, 'down'], check=True)
        containers = client.containers.list(
            all=True,
            filters={'ancestor': 'ghcr.io/kiwix/kiwix-serve:3.7.0'}
        )
        for c in containers:
            c.remove()
        print("Docker services cleaned up")