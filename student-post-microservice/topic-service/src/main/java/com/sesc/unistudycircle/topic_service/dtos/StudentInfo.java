package com.sesc.unistudycircle.topic_service.dtos;

import lombok.Data;

@Data
public class StudentInfo {
    private Long studentId;
    private String firstName;
    private String lastName;
    private String email;
}
