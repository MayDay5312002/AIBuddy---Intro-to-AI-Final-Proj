import subprocess
import docker
import tkinter as tk
from tkinter.messagebox import askyesno
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

try:
    client = docker.from_env()

    for container in client.containers.list(all=True, filters={'ancestor': 'ghcr.io/kiwix/kiwix-serve:3.7.0'}):
        try:
            if container.status == 'running':
                container.stop()
            container.remove()
        except Exception as e:
            print(f"Error processing container {container.name}: {e}")

    # from tkinter.messagebox import askyesno

    root = tk.Tk()
    root.withdraw()  # Hide the root window
    root.attributes('-topmost', True)  # Make the root window stay on top temporarily
    
    answer = askyesno(title="Confirm", message="Do you want to stop Docker?")
    
    root.attributes('-topmost', False)  # Return to normal stacking behavior
    root.destroy()  # Destroy the hidden root win
    # if answer:
    print("answer:", answer)
        # DETACHED_PROCESS = 0x00000008  # Windows only

        # subprocess.Popen(
        #     ['docker', 'desktop', 'stop'],
        #     stdout=subprocess.DEVNULL,
        #     stderr=subprocess.DEVNULL,
        #     start_new_session=True,  # Unix-like
        #     creationflags=DETACHED_PROCESS  # Windows
        # )
        # process.


    

except Exception as e:
    print(f"Error: {e}")


