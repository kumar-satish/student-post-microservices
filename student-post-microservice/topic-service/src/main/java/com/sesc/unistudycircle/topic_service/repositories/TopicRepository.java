package com.sesc.unistudycircle.topic_service.repositories;

import com.sesc.unistudycircle.topic_service.entities.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findAllByStudentId(Long studentId);

    List<Topic> findAllByStudentName(String studentName);

    List<Topic> findAllByTopicDate(LocalDate topicDate);
}
