import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WordImportService, PendingWord } from '../../../core/services/word-import.service';

@Component({
  selector: 'app-word-import',
  imports: [RouterLink, FormsModule],
  templateUrl: './word-import.html',
  styleUrl: './word-import.scss',
})
export class WordImport implements OnInit, OnDestroy {
  private readonly svc = inject(WordImportService);
  private pollTimer?: ReturnType<typeof setInterval>;

  readonly tab             = signal<'upload' | 'review'>('upload');
  readonly selectedFile    = signal<File | null>(null);
  readonly wordCount       = signal(0);
  readonly dragOver        = signal(false);
  readonly isImporting     = signal(false);
  readonly jobStatus       = signal<any>(null);
  readonly pendingWords    = signal<PendingWord[]>([]);
  readonly isLoadingPending = signal(false);
  readonly isBulkApproving = signal(false);
  readonly editingId       = signal<number | null>(null);
  readonly toast           = signal<string | null>(null);
  readonly toastType       = signal<'ok' | 'err'>('ok');

  editData: Partial<PendingWord> = {};

  ngOnInit(): void {}
  ngOnDestroy(): void { if (this.pollTimer) clearInterval(this.pollTimer); }

  private showToast(msg: string, type: 'ok' | 'err' = 'ok'): void {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(null), 3500);
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) { this.selectedFile.set(file); this.estimateWordCount(file); }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault(); this.dragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) { this.selectedFile.set(file); this.estimateWordCount(file); }
  }

  private estimateWordCount(file: File): void {
    // Rough estimate based on file size — actual count shown after upload
    this.wordCount.set(Math.round(file.size / 15));
  }

  startImport(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.isImporting.set(true);
    this.svc.startImport(file).subscribe({
      next: (res) => {
        this.wordCount.set(res.total_words);
        this.pollJob(res.job_id);
      },
      error: () => {
        this.isImporting.set(false);
        this.showToast('আমদানি শুরু করতে ব্যর্থ হয়েছে', 'err');
      },
    });
  }

  private pollJob(jobId: number): void {
    this.pollTimer = setInterval(() => {
      this.svc.getStatus(jobId).subscribe({
        next: (s) => {
          this.jobStatus.set(s);
          if (s.status === 'done' || s.status === 'failed') {
            clearInterval(this.pollTimer);
            this.isImporting.set(false);
            if (s.status === 'done') {
              this.showToast(`${s.processed_words} টি শব্দ সফলভাবে আমদানি হয়েছে!`);
            }
          }
        },
      });
    }, 2000);
  }

  loadPending(): void {
    this.isLoadingPending.set(true);
    this.svc.getPendingWords().subscribe({
      next: (res) => { this.pendingWords.set(res.words); this.isLoadingPending.set(false); },
      error: () => this.isLoadingPending.set(false),
    });
  }

  approveWord(w: PendingWord): void {
    this.svc.approveWord(w.id).subscribe({
      next: () => {
        this.pendingWords.update(ws => ws.filter(x => x.id !== w.id));
        this.showToast(`"${w.text}" অনুমোদিত হয়েছে`);
      },
      error: () => this.showToast('অনুমোদন ব্যর্থ', 'err'),
    });
  }

  rejectWord(w: PendingWord): void {
    this.svc.rejectWord(w.id).subscribe({
      next: () => {
        this.pendingWords.update(ws => ws.filter(x => x.id !== w.id));
        this.showToast(`"${w.text}" প্রত্যাখ্যাত হয়েছে`);
      },
      error: () => this.showToast('প্রত্যাখ্যান ব্যর্থ', 'err'),
    });
  }

  bulkApproveAll(): void {
    this.isBulkApproving.set(true);
    this.svc.bulkApprove().subscribe({
      next: (res) => {
        this.pendingWords.set([]);
        this.isBulkApproving.set(false);
        this.showToast(`${res.approved} টি শব্দ অনুমোদিত হয়েছে`);
      },
      error: () => { this.isBulkApproving.set(false); this.showToast('ব্যর্থ', 'err'); },
    });
  }

  startEdit(w: PendingWord): void {
    this.editingId.set(w.id);
    this.editData = {
      short_definition: w.short_definition,
      bangla_meaning: w.bangla_meaning,
      example_sentence: w.example_sentence,
      example_bangla: w.example_bangla,
      synonyms: w.synonyms,
      phonetic_uk: w.phonetic_uk,
    };
  }

  cancelEdit(): void { this.editingId.set(null); this.editData = {}; }

  saveEdit(w: PendingWord): void {
    this.svc.editWord(w.id, this.editData).subscribe({
      next: () => {
        this.pendingWords.update(ws => ws.map(x =>
          x.id === w.id ? { ...x, ...this.editData } : x
        ));
        this.editingId.set(null);
        this.showToast('সংরক্ষিত হয়েছে');
      },
      error: () => this.showToast('সংরক্ষণ ব্যর্থ', 'err'),
    });
  }

  saveAndApprove(w: PendingWord): void {
    this.svc.editWord(w.id, this.editData).subscribe({
      next: () => this.approveWord({ ...w, ...this.editData } as PendingWord),
      error: () => this.showToast('ব্যর্থ', 'err'),
    });
  }
}
