#Project by Benjamin Taylor

import socket

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

client_socket.connect(('127.0.0.1', 12345)) 
print("Connected to the server.")

message = "Hello, server!"
client_socket.send(message.encode()) 
print(f"Sent to server: {message}")

response = client_socket.recv(1024).decode()  
print(f"Received from server: {response}")

client_socket.close()  
print("Client connection closed.")

#"C:\Users\benjq\Desktop\Socket Programming Python\client.py"