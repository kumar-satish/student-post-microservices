package com.sesc.unistudycircle.topic_service.services;
import com.sesc.unistudycircle.topic_service.entities.Topic; import org.springframework.security.core.Authentication; import java.util.List;
public interface TopicService { List<Topic> findAll(); List<Topic> findPublic(); List<Topic> findMine(String owner); Topic view(Long id, Authentication auth); Topic create(Topic topic,String owner); Topic update(Long id,Topic topic,Authentication auth); void delete(Long id,Authentication auth); }
