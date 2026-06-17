import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamListItem } from '../../../core/models/exam.model';

@Component({
  selector: 'app-model-test-list',
  imports: [],
  templateUrl: './model-test-list.html',
  styleUrl: './model-test-list.scss',
})
export class ModelTestList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);

  readonly exams = signal<ExamListItem[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  readonly activeTab = signal<'withSubject' | 'withoutSubject'>('withSubject');

  readonly examsWithSubject = computed(() => this.exams().filter((e) => e.subject_name));
  readonly examsWithoutSubject = computed(() => this.exams().filter((e) => !e.subject_name));

  ngOnInit(): void {
    const examTypeId = this.route.snapshot.paramMap.get('typeId');
    if (!examTypeId) {
      this.isLoading.set(false);
      this.loadFailed.set(true);
      return;
    }

    this.examService.getModelExams(examTypeId).subscribe({
      next: (exams) => {
        this.exams.set(exams);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  setTab(tab: 'withSubject' | 'withoutSubject'): void {
    this.activeTab.set(tab);
  }

  openDetails(examId: string): void {
    this.router.navigate(['/model-tests', 'details', examId]);
  }

  async share(examId: string, title: string): Promise<void> {
    const url = `${window.location.origin}/model-tests/details/${examId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: 'এই পরীক্ষাটি দেখুন:', url });
      } catch {
        // user cancelled the share sheet — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('লিংক কপি হয়েছে!');
      } catch {
        alert('লিংক কপি ব্যর্থ হয়েছে!');
      }
    }
  }
}
