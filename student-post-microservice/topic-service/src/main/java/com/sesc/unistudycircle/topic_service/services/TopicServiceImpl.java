package com.sesc.unistudycircle.topic_service.services;

import com.sesc.unistudycircle.topic_service.dtos.StudentInfo;
import com.sesc.unistudycircle.topic_service.entities.Topic;
import com.sesc.unistudycircle.topic_service.repositories.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicServiceImpl implements TopicService {
    @Value("${student-service-base-url}")
    private String studentServiceBaseUrl;

    private final TopicRepository repository;
    private final HttpRemoteServiceImpl httpRemoteService;
    @Override
    public Topic postTopic(Topic topic) {
        validateStudent(topic.getStudentId());
        return repository.save(topic);
    }

    private void validateStudent(Long studentId) {
        StudentInfo studentInfo = httpRemoteService.get(studentServiceBaseUrl + "/" + studentId);
        if(Objects.isNull(studentInfo)) {
            throw new IllegalArgumentException("Student id is invalid");
        }
        log.info("Available student: {}", studentInfo);
    }

    @Override
    public Topic viewTopic(Long topicId) {
        return repository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with ID: " + topicId));
    }

    @Override
    public Topic updateTopic(Long topicId, Topic updatedTopic) {
        Topic existingTopic = repository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with ID: " + topicId));

        existingTopic.setTopicName(updatedTopic.getTopicName());
        existingTopic.setTopicDate(updatedTopic.getTopicDate());
        existingTopic.setTopicContent(updatedTopic.getTopicContent());
        existingTopic.setStudentId(updatedTopic.getStudentId());
        existingTopic.setStudentName(updatedTopic.getStudentName());
        return repository.save(existingTopic);
    }

    @Override
    public void deleteTopic(Long topicId) {
        if (!repository.existsById(topicId)) {
            throw new RuntimeException("Topic not found with ID: " + topicId);
        }
        repository.deleteById(topicId);
    }

    @Override
    public List<Topic> searchAllTopicByStudentId(Long studentId) {
        return repository.findAllByStudentId(studentId);
    }

    @Override
    public List<Topic> searchAllTopicByStudentName(String studentName) {
        return repository.findAllByStudentName(studentName);
    }

    @Override
    public Topic searchTopicByTopicId(Long topicId) {
        return repository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with ID: " + topicId));
    }

    @Override
    public List<Topic> searchTopicByDate(LocalDate topicDate) {
        return repository.findAllByTopicDate(topicDate);
    }
}

