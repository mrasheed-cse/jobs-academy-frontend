import { Component, OnInit, inject, signal } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { SubscriptionPlan, UserSubscription } from '../../../core/models/content.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-subscription-plans', imports: [], templateUrl: './subscription-plans.html', styleUrl: './subscription-plans.scss' })
export class SubscriptionPlans implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly authService = inject(AuthService);
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly mySubscriptions = signal<UserSubscription[]>([]);
  readonly isLoading = signal(true);
  readonly selectedPrices = signal<Record<number, number>>({});

  ngOnInit(): void {
    this.contentService.getSubscriptionPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        const defaults: Record<number, number> = {};
        plans.forEach((p) => { if (p.prices.length) defaults[p.id] = p.prices[0].id; });
        this.selectedPrices.set(defaults);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    if (this.authService.getAccessToken()) {
      this.contentService.getUserSubscriptions().subscribe({
        next: (subs) => this.mySubscriptions.set(subs),
        error: () => {},
      });
    }
  }

  isSubscribed(planId: number): boolean { return this.mySubscriptions().some((s) => s.plan === planId); }

  onPriceChange(planId: number, priceId: number): void {
    this.selectedPrices.update((prev) => ({ ...prev, [planId]: priceId }));
  }

  buyPlan(plan: SubscriptionPlan): void {
    if (!this.authService.getAccessToken()) { alert('অনুগ্রহ করে প্রথমে লগইন করুন।'); return; }
    const priceId = this.selectedPrices()[plan.id];
    if (!priceId) return;
    this.contentService.subscribe(priceId).subscribe({
      next: () => { alert(`${plan.name} প্ল্যানে সফলভাবে সাবস্ক্রাইব করা হয়েছে!`); window.location.reload(); },
      error: () => alert('সাবস্ক্রিপশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'),
    });
  }
}
