import socket

#Creating the socket object
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

host = '127.0.0.1'
port = 12345

#Binding to socket
serversocket.bind((host, port)) #Host will be replaced/substituted with IP, if changed and not running on host

#Starting TCP listener
serversocket.listen(3)

print("Server is listening on port 12345...")

while True:
    #Starting the connection
    clientsocket, address = serversocket.accept()
    
    print("Received connection from %s " % str(address))
    
    message = "Connection successful." + "\r\n" + "Hello! Thank you for connecting to the server" + "\r\n"
    
    clientsocket.send(message.encode('ascii'))
    
    clientsocket.close()