import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamType } from '../../../core/models/exam.model';

@Component({
  selector: 'app-past-exam-types',
  imports: [],
  templateUrl: './past-exam-types.html',
  styleUrl: './past-exam-types.scss',
})
export class PastExamTypes implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly router = inject(Router);

  readonly examTypes = signal<ExamType[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  readonly searchQuery = signal('');

  readonly filteredTypes = () =>
    this.examTypes().filter((t) =>
      t.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    );

  ngOnInit(): void {
    this.examService.getPastExamTypes().subscribe({
      next: (types) => { this.examTypes.set(types); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.loadFailed.set(true); },
    });
  }

  openType(typeId: number): void {
    this.router.navigate(['/past-exams', typeId]);
  }
}
