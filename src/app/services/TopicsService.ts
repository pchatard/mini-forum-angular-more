import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Topic } from '../models/Topic';

@Injectable()
export class TopicsService {
    apiUrl = 'http://localhost:8080/api/topic/';

    topics: Topic[] = [];
    topicsSubject = new Subject<Topic[]>();

    constructor(private httpClient: HttpClient) {
        this.httpClient.get<Topic[]>(this.apiUrl, { observe: 'body' }).subscribe((topics: Topic[]) => {
            this.topics = topics.map(topic => {
                topic.date = new Date(topic.date);
                return topic;
            });

            this.emitTopics();
        });
    }

    emitTopics(): void {
        this.topicsSubject.next(this.topics);
    }

    getTopics(): Observable<Topic[]> {
        return this.httpClient.get<Topic[]>(this.apiUrl, { observe: 'body' });
    }

    getTopic(id: number): Observable<Topic> {
        return this.httpClient.get<Topic>(this.apiUrl + id, { observe: 'body' });
    }

    createNewTopic(topic: Topic): Observable<Topic> {
        return this.httpClient.post<Topic>(this.apiUrl, topic);
    }

    updateTopic(topic: Topic, title: string): Observable<Topic> {
        return this.httpClient.patch<Topic>(this.apiUrl + topic.id, { title });
    }

    deleteTopic(topic: Topic): Observable<any> {
        return this.httpClient.delete(this.apiUrl + topic.id);
    }

    refreshTopics(): void {
        this.getTopics().subscribe((topics: Topic[]) => {
            this.topics = topics.map(topic => {
                topic.date = new Date(topic.date);
                return topic;
            });

            this.emitTopics();
        });
    }
}
