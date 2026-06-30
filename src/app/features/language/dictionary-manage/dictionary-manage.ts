import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ContentService } from '../../../core/services/content.service';
import {
  DictLanguage,
  DictWordCreateRequest,
  DictExcelUploadResult,
} from '../../../core/models/content.model';

type Tab = 'single' | 'bulk';

@Component({
  selector: 'app-dictionary-manage',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './dictionary-manage.html',
  styleUrl: './dictionary-manage.scss',
})
export class DictionaryManage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contentService = inject(ContentService);

  readonly activeTab = signal<Tab>('single');
  readonly languages = signal<DictLanguage[]>([]);
  readonly languagesLoading = signal(true);
  readonly languagesError = signal(false);
  readonly selectedLanguageId = signal<number | null>(null);

  // --- Single-word form state ---
  readonly wordForm = this.fb.group({
    word: ['', Validators.required],
    pos: ['', Validators.required],
    phonetic_uk: [''],
    phonetic_us: [''],
    senses: this.fb.array([this.buildSenseGroup()]),
  });
  readonly isSubmittingWord = signal(false);
  readonly wordSubmitSuccess = signal<string | null>(null);
  readonly wordSubmitError = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  // --- Bulk upload state ---
  readonly selectedFile = signal<File | null>(null);
  readonly isUploading = signal(false);
  readonly uploadResult = signal<DictExcelUploadResult | null>(null);
  readonly uploadError = signal<string | null>(null);

  get senses(): FormArray {
    return this.wordForm.get('senses') as FormArray;
  }

  ngOnInit(): void {
    this.contentService.getLanguages().subscribe({
      next: (langs) => {
        this.languages.set(langs);
        this.languagesLoading.set(false);
        if (langs.length === 1) this.selectedLanguageId.set(langs[0].id);
      },
      error: () => { this.languagesLoading.set(false); this.languagesError.set(true); },
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  selectLanguage(id: number): void {
    this.selectedLanguageId.set(id);
  }

  // --- Single word form ---

  private buildSenseGroup(): FormGroup {
    return this.fb.group({
      short_definition: ['', Validators.required],
      usage_note: [''],
      bangla_meanings: [''], // comma-separated, split on submit
      definition_text: [''],
      examples: [''],
      examples_bn: [''],
      synonyms: [''],
      antonyms: [''],
    });
  }

  addSense(): void {
    this.senses.push(this.buildSenseGroup());
  }

  removeSense(index: number): void {
    if (this.senses.length > 1) this.senses.removeAt(index);
  }

  private splitLines(value: string | null | undefined): string[] {
    if (!value) return [];
    return value.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  private splitCommas(value: string | null | undefined): string[] {
    if (!value) return [];
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }

  submitWord(): void {
    const langId = this.selectedLanguageId();
    if (!langId) {
      this.wordSubmitError.set('একটি ভাষা নির্বাচন করুন।');
      return;
    }
    if (this.wordForm.invalid) {
      this.wordForm.markAllAsTouched();
      return;
    }

    const raw = this.wordForm.getRawValue();
    const payload: DictWordCreateRequest = {
      word: raw.word!.trim(),
      pos: raw.pos!.trim(),
      phonetic_uk: raw.phonetic_uk ?? '',
      phonetic_us: raw.phonetic_us ?? '',
      senses: (raw.senses ?? []).map((s: any) => ({
        short_definition: s['short_definition'].trim(),
        usage_note: s['usage_note'] ?? '',
        bangla_meanings: this.splitCommas(s['bangla_meanings']),
        definition_text: s['definition_text'] ?? '',
        examples: this.splitLines(s['examples']),
        examples_bn: this.splitLines(s['examples_bn']),
        synonyms: this.splitCommas(s['synonyms']),
        antonyms: this.splitCommas(s['antonyms']),
      })),
    };

    this.isSubmittingWord.set(true);
    this.wordSubmitSuccess.set(null);
    this.wordSubmitError.set(null);
    this.fieldErrors.set({});

    this.contentService.createWord(langId, payload).subscribe({
      next: (word) => {
        this.isSubmittingWord.set(false);
        this.wordSubmitSuccess.set(`"${word.text}" সফলভাবে যোগ করা হয়েছে।`);
        this.resetWordForm();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmittingWord.set(false);
        this.handleWordError(err);
      },
    });
  }

  private handleWordError(err: HttpErrorResponse): void {
    if (err.status === 409) {
      this.wordSubmitError.set(err.error?.detail ?? 'এই শব্দটি ইতিমধ্যে বিদ্যমান।');
      return;
    }
    if (err.status === 400 && err.error && typeof err.error === 'object') {
      // DRF validation errors come back as {field: [messages]}
      const errors: Record<string, string> = {};
      for (const [key, val] of Object.entries(err.error)) {
        errors[key] = Array.isArray(val) ? val.join(' ') : String(val);
      }
      this.fieldErrors.set(errors);
      this.wordSubmitError.set('ফর্মে কিছু তথ্য সঠিক নয়, নিচে দেখুন।');
      return;
    }
    this.wordSubmitError.set(err.error?.detail ?? 'শব্দ যোগ করতে ব্যর্থ হয়েছে।');
  }

  private resetWordForm(): void {
    this.wordForm.reset();
    while (this.senses.length > 1) this.senses.removeAt(0);
    this.senses.at(0).reset();
  }

  // --- Bulk Excel upload ---

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.uploadResult.set(null);
    this.uploadError.set(null);
  }

  uploadExcel(): void {
    const langId = this.selectedLanguageId();
    const file = this.selectedFile();
    if (!langId) { this.uploadError.set('একটি ভাষা নির্বাচন করুন।'); return; }
    if (!file) { this.uploadError.set('একটি ফাইল নির্বাচন করুন।'); return; }

    this.isUploading.set(true);
    this.uploadResult.set(null);
    this.uploadError.set(null);

    this.contentService.uploadDictionaryExcel(langId, file).subscribe({
      next: (result) => {
        this.isUploading.set(false);
        this.uploadResult.set(result);
        this.selectedFile.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.isUploading.set(false);
        this.uploadError.set(err.error?.detail ?? err.error?.file?.[0] ?? 'আপলোড ব্যর্থ হয়েছে।');
      },
    });
  }
}
