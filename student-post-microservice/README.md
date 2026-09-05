
## **How to Start Student-Post Microservices Application**
This guide will help you set up and run the Student-Post Microservices step by step.

>#### Step 1: Configure Database

> Option A: You must configure your local database username and password as `username: root` and `password: root` to execute the student
  and post microservices. OR
> 
> Option B: Update the database username and password in the `student-service.yaml` and `topic-service.yaml` files located in your
  github repo. (If you don't have github repo with these yaml files, then create a public github repo with similar yaml files
  avaible at https://github.com/LBUSESC/microservices-config-server) and update this github repo `url` in the `application.yaml` file
  located in the `src/main/resources` directory of config-server microservice.




> #### Step 2: Start Service Discovery 
> Start the Eureka Server for service registration and discovery.


> #### Step 3: Start Config Server 
> Start the Config Server to load configurations.

>  #### Step 4: Start API Gateway 
> Run the API Gateway to manage microservice routing.

> #### Step 5: Start Student-Service  
> Run the `student-service` microservice.


> #### Step 6: Start Post-Service  
> Run the `topic-service` microservice.

> #### Step 7: Testing with Postman  
> Use the Postman collection in the repository to test `student` and `topic` microservices.

Now, your microservices should be running successfully! 

