package com.sesc.unistudycircle.topic_service.services;

import com.sesc.unistudycircle.topic_service.entities.Topic;

import java.time.LocalDate;
import java.util.List;

public interface TopicService {

    Topic postTopic(Topic topic);

    Topic viewTopic(Long topicId);

    Topic updateTopic(Long topicId, Topic updatedTopic);

    void deleteTopic(Long topicId);

    List<Topic> searchAllTopicByStudentId(Long studentId);

    List<Topic> searchAllTopicByStudentName(String studentName);

    Topic searchTopicByTopicId(Long topicId);

    List<Topic> searchTopicByDate(LocalDate topicDate);
}
