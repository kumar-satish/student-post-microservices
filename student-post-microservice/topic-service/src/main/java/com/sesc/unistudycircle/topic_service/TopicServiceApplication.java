package com.sesc.unistudycircle.topic_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TopicServiceApplication {

	public static void main(String[] args) {

		SpringApplication.run(TopicServiceApplication.class, args);
		System.out.println("TopicServiceApplication started");
	}

}
