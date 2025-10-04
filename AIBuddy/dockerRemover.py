import subprocess
import docker
import time

def start_compose(compose_file):
    subprocess.run(['docker', 'compose', '-f', compose_file, 'up', '-d'], check=True)

def stop_compose(compose_file):
    subprocess.run(['docker', 'compose', '-f', compose_file, 'down'], check=True)

# Example usage
# start_compose('searxng-docker/docker-compose.yaml')
# start_compose('kiwix-serve/docker-compose.yml')

# Independent Python logic here...

stop_compose('searxng-docker/docker-compose.yaml')
# stop_compose('kiwix-serve/docker-compose.yml')


client = docker.from_env()

for container in client.containers.list(all=True, filters={'ancestor': 'ghcr.io/kiwix/kiwix-serve:3.7.0'}):
    try:
        if container.status == 'running':
            container.stop()
        container.remove()
    except Exception as e:
        print(f"Error processing container {container.name}: {e}")
