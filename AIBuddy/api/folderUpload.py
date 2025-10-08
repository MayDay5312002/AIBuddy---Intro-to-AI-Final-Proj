import tkinter as tk
from tkinter import filedialog

root = tk.Tk()
root.iconbitmap('frontend/static/images/Logo.ico')
root.withdraw()  # Hide the root win
folder_path = filedialog.askdirectory()
print(folder_path)