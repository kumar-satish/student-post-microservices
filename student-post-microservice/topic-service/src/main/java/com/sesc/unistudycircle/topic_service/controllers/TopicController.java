package com.sesc.unistudycircle.topic_service.controllers;
import com.sesc.unistudycircle.topic_service.entities.Topic; import com.sesc.unistudycircle.topic_service.services.TopicService; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequiredArgsConstructor public class TopicController { private final TopicService topics;
 @GetMapping({"/all","/public"}) public List<Topic> publicTopics(){return topics.findPublic();}
 @GetMapping("/mine") public List<Topic> mine(Authentication a){return topics.findMine(a.getName());}
 @GetMapping("/{id}") public Topic view(@PathVariable Long id,Authentication a){return topics.view(id,a);}
 @PostMapping("/create") public ResponseEntity<Topic> create(@RequestBody Topic t,Authentication a){return ResponseEntity.status(HttpStatus.CREATED).body(topics.create(t,a.getName()));}
 @PutMapping("/{id}") public Topic update(@PathVariable Long id,@RequestBody Topic t,Authentication a){return topics.update(id,t,a);}
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id,Authentication a){topics.delete(id,a);return ResponseEntity.noContent().build();}
 @GetMapping("/admin/all") public List<Topic> admin(){return topics.findAll();}}
