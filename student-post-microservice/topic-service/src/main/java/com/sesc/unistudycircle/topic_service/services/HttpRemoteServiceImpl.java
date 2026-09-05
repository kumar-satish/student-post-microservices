package com.sesc.unistudycircle.topic_service.services;

import com.sesc.unistudycircle.topic_service.dtos.StudentInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.service.spi.ServiceException;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class HttpRemoteServiceImpl implements HttpRemoteService {
    private final RestTemplate restTemplate;
    private final  WebClient.Builder webClientBuilder;
    private final RestClient restClient;

    @Override
    public StudentInfo get(String url) {
        return webClientBuilder.build()
                .get()
                .uri(url)
                .retrieve()
                .bodyToMono(StudentInfo.class)
                .onErrorMap(e -> new IllegalArgumentException("Student ID is invalid", e))
                .block();
    }

//    @Override
//    public StudentInfo get(String url) {
//        try {
//            return restClient
//                    .get()
//                    .uri(url)
//                    .retrieve()
//                    .onStatus(HttpStatusCode::isError, (request, response) -> {
//                        throw new ServiceException("Error response from server: " + response.getStatusCode());
//                    })
//                    .body(StudentInfo.class);
//        } catch (RestClientResponseException ex) {
//            log.error("HTTP error while fetching student info from {}: {} - {}",
//                    url, ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
//            throw new ServiceException("Failed to fetch student info: " + ex.getMessage(), ex);
//        } catch (RestClientException ex) {
//            log.error("Client error while calling {}", url, ex);
//            throw new ServiceException("Client error occurred while fetching student info", ex);
//        } catch (Exception ex) {
//            log.error("Unexpected error while calling {}", url, ex);
//            throw new ServiceException("Unexpected error occurred", ex);
//        }
//    }


}
