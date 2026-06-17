import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamType } from '../../../core/models/exam.model';

@Component({
  selector: 'app-model-test-types',
  imports: [],
  templateUrl: './model-test-types.html',
  styleUrl: './model-test-types.scss',
})
export class ModelTestTypes implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly router = inject(Router);

  readonly examTypes = signal<ExamType[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  ngOnInit(): void {
    this.examService.getModelExamTypes().subscribe({
      next: (types) => {
        this.examTypes.set(types);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  openType(typeId: number): void {
    this.router.navigate(['/model-tests', typeId]);
  }
}
