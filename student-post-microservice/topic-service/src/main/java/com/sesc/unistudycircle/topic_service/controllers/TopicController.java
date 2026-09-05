package com.sesc.unistudycircle.topic_service.controllers;

import com.sesc.unistudycircle.topic_service.entities.Topic;
import com.sesc.unistudycircle.topic_service.services.TopicServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class TopicController {
    private final TopicServiceImpl topicService;

    @PostMapping("create")
    public ResponseEntity<Topic> postTopic(@RequestBody Topic topic) {
        Topic createdTopic = topicService.postTopic(topic);
        return new ResponseEntity<>(createdTopic, HttpStatus.CREATED);
    }

    @GetMapping("/{topicId}")
    public ResponseEntity<Topic> viewTopic(@PathVariable Long topicId) {
        Topic topic = topicService.viewTopic(topicId);
        return new ResponseEntity<>(topic, HttpStatus.OK);
    }

    @PutMapping("/{topicId}")
    public ResponseEntity<Topic> updateTopic(
            @PathVariable Long topicId,
            @RequestBody Topic updatedTopic) {
        Topic topic = topicService.updateTopic(topicId, updatedTopic);
        return new ResponseEntity<>(topic, HttpStatus.OK);
    }

    @DeleteMapping("/{topicId}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long topicId) {
        topicService.deleteTopic(topicId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}