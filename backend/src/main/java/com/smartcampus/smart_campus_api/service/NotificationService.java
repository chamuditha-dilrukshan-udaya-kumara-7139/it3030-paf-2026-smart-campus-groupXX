package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.Notification;
import com.smartcampus.smart_campus_api.repository.NotificationRepository;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(String userId, String message, String type) {
        Notification notification = Notification.builder()
            .userId(userId)
            .message(message)
            .type(type)
            .isRead(false)
            .build();
        notification.onCreate();

        return notificationRepository.save(notification);
    }

    public void deleteNotification(String userId, String notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
            .orElseThrow(() -> new NoSuchElementException(
                "Notification not found for id: " + notificationId + " and userId: " + userId
            ));
        notificationRepository.delete(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() ->
                new NoSuchElementException("Notification not found for id: " + notificationId));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
            .orElseThrow(() -> new NoSuchElementException(
                "Notification not found for id: " + notificationId + " and userId: " + userId
            ));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
