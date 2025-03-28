import socket

clientsocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

host = '127.0.0.1'
port = 12345

clientsocket.connect((host, port))

message = clientsocket.recv(1024)

clientsocket.close()

print(message.decode('ascii'))