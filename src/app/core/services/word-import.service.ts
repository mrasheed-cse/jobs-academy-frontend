import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PendingWord {
  id: number;
  text: string;
  phonetic_uk: string;
  phonetic_us: string;
  part_of_speech: string;
  word_level: string;
  status: string;
  short_definition: string;
  bangla_meaning: string;
  synonyms: string;
  example_sentence: string;
  example_bangla: string;
}

@Injectable({ providedIn: 'root' })
export class WordImportService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  startImport(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.base}/api/word-import/start/`, fd);
  }

  getStatus(jobId: number): Observable<any> {
    return this.http.get(`${this.base}/api/word-import/${jobId}/status/`);
  }

  getPendingWords(): Observable<{ words: PendingWord[], total: number }> {
    return this.http.get<any>(`${this.base}/api/word-import/pending/`);
  }

  approveWord(id: number): Observable<any> {
    return this.http.post(`${this.base}/api/word-import/words/${id}/approve/`, {});
  }

  rejectWord(id: number): Observable<any> {
    return this.http.post(`${this.base}/api/word-import/words/${id}/reject/`, {});
  }

  bulkApprove(ids?: number[]): Observable<any> {
    const body = ids ? { word_ids: ids } : { all: true };
    return this.http.post(`${this.base}/api/word-import/bulk-approve/`, body);
  }

  editWord(id: number, data: Partial<PendingWord>): Observable<any> {
    return this.http.patch(`${this.base}/api/word-import/words/${id}/`, data);
  }
}
