package com.sesc.unistudycircle.topic_service.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "tb_topics")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long topicId;

    private String topicName;

    private LocalDate topicDate;

    @Lob
    private String topicContent;

    private Long studentId;

    private String studentName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TopicVisibility visibility = TopicVisibility.PRIVATE;

    @Column(length = 50)
    private String ownerUsername;
}
