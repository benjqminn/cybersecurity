#Project by Benjamin Taylor

import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server_socket.bind(('127.0.0.1', 12345)) 

server_socket.listen(1) 
print("Server is listening on port 12345...")

client_socket, client_address = server_socket.accept()
print(f"Connected to client at {client_address}")

message = client_socket.recv(1024).decode() 
print(f"Received from client: {message}")

response = "Hello, client! Your message was received."
client_socket.send(response.encode())

client_socket.close() 
server_socket.close()

print("Server connection closed.")

#"C:\Users\benjq\Desktop\Socket Programming Python\server.py"