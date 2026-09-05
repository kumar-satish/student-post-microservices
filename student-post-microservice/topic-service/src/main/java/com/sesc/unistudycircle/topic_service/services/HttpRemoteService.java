package com.sesc.unistudycircle.topic_service.services;

import com.sesc.unistudycircle.topic_service.dtos.StudentInfo;

public interface HttpRemoteService {
    StudentInfo get(String url);
}
