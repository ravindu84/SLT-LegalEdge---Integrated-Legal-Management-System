<template>
  <q-page class="innovation-page q-pa-xl">
    <!-- ─── HEADER SECTION ───────────────────────────────────── -->
    <div class="header-section text-center q-mb-xl animate-fade-in">
      <div class="innovation-badge q-mb-md">
        <q-icon name="auto_awesome" color="amber-8" size="20px" />
        <span class="text-amber-8 text-weight-bold q-ml-sm">{{ $t('innovation.badge') }}</span>
      </div>
      <h1 class="text-h2 text-weight-bolder text-white q-my-sm">{{ $t('innovation.title') }}</h1>
      <p class="text-subtitle1 text-blue-2 opacity-80 max-width-700 mx-auto">
        {{ $t('innovation.subtitle') }}
      </p>
    </div>

    <!-- ─── MILESTONES GRID ───────────────────────────────────── -->
    <div class="row q-col-gutter-xl items-stretch">
      <div v-for="(pillar, idx) in pillars" :key="idx" class="col-12 col-md-4">
        <q-card class="innovation-card animate-card-pop" :style="{ '--delay': idx * 0.1 + 's' }">
          <q-card-section class="q-pa-lg">
            <div class="icon-box q-mb-lg" :class="pillar.colorClass">
              <q-icon :name="pillar.icon" size="32px" />
            </div>
            <div class="text-h5 text-weight-bold text-white q-mb-md">{{ pillar.title }}</div>
            <p class="text-body2 text-blue-1 opacity-70">{{ pillar.description }}</p>

            <q-list dense dark class="feature-list q-mt-md">
              <q-item v-for="feat in pillar.features" :key="feat" class="q-px-none">
                <q-item-section avatar class="min-width-auto q-mr-sm">
                  <q-icon name="check_circle" color="cyan-4" size="16px" />
                </q-item-section>
                <q-item-section class="text-caption text-blue-2">{{ feat }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <div class="card-glow" :class="pillar.colorClass"></div>
        </q-card>
      </div>
    </div>

    <!-- ─── SECURITY POSTURE (BLOCKCHAIN & ZERO-TRUST) ──────────── -->
    <div class="security-banner q-mt-xl q-pa-xl shadow-24 animate-slide-up" style="animation-delay: 0.4s">
      <div class="row q-col-gutter-xl items-center">
        <div class="col-12 col-md-5 text-center">
          <q-icon name="security" size="100px" color="amber-8" class="q-mb-md glow-amber" />
          <div class="text-h4 text-weight-bold text-white q-mb-sm">
            {{ $t('innovation.security.title') }}
          </div>
          <div class="innovation-badge q-mb-md q-mt-sm">
            <q-icon name="verified_user" size="16px" color="amber-8" class="q-mr-sm" />
            <span class="text-amber-8 text-weight-bold">{{ $t('innovation.security.badge') }}</span>
          </div>
        </div>
        <div class="col-12 col-md-7">
          <q-card class="security-card q-mb-md shadow-3">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon name="shield" color="cyan-4" size="24px" class="q-mr-sm" />
                <div class="text-h6 text-white text-weight-bold">{{ $t('innovation.security.currentArchitecture.title') }}</div>
              </div>
              <p class="text-body2 text-blue-2 opacity-80 q-mb-none">
                {{ $t('innovation.security.currentArchitecture.desc') }}
              </p>
            </q-card-section>
          </q-card>
          
          <q-card class="security-card highlight-border shadow-5">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon name="link" color="amber-8" size="24px" class="q-mr-sm" />
                <div class="text-h6 text-amber-8 text-weight-bold">{{ $t('innovation.security.futureEvolution.title') }}</div>
              </div>
              <p class="text-body2 text-blue-2 opacity-80 q-mb-none">
                {{ $t('innovation.security.futureEvolution.desc') }}
              </p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ─── VISON STATEMENT ─────────────────────────────────── -->
    <div class="vision-banner q-mt-xl q-pa-xl text-center shadow-24 animate-slide-up">
      <div class="row items-center justify-center q-gutter-md">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bold text-white q-mb-sm">
            {{ $t('innovation.visionTitle') }}
          </div>
          <p class="text-body1 text-blue-2">
            {{ $t('innovation.visionDesc') }}
          </p>
        </div>
        <div class="col-12 col-md-3">
          <q-btn
            unelevated
            rounded
            color="amber-8"
            text-color="black"
            :label="$t('innovation.exploreBtn')"
            icon-right="bolt"
            class="full-width text-weight-bold"
            size="lg"
          />
        </div>
      </div>
    </div>
    
    <!-- ─── MOBILE EXPANSION TEASER ────────────────────────── -->
    <div class="mobile-teaser-section q-mt-xl q-pa-xl animate-slide-up" style="animation-delay: 0.5s">
      <div class="row q-col-gutter-xl items-center">
        <div class="col-12 col-md-6 order-last order-md-first">
          <div class="mobile-mockup-container">
            <div class="phone-frame shadow-24">
              <div class="phone-screen bg-dark overflow-hidden flex flex-center">
                <q-icon name="auto_awesome" size="120px" class="ai-glow-icon" />
                <div class="phone-content text-center q-pa-md absolute-bottom q-mb-xl">
                  <div class="text-h6 text-white text-weight-bolder">LegalEdge AI</div>
                  <div class="text-caption text-amber-5">System Ready...</div>
                  <div class="q-mt-md flex flex-center">
                    <q-spinner-dots color="amber-8" size="24px" />
                  </div>
                </div>
              </div>
            </div>
            <div class="phone-reflection"></div>
            <div class="phone-float-shadow"></div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="innovation-badge q-mb-md">
            <q-icon name="edgesensor_high" size="18px" color="amber-8" class="q-mr-sm" />
            <span class="text-amber-8 text-weight-bold">{{ $t('innovation.mobile.badge') }}</span>
          </div>
          <h2 class="text-h3 text-weight-bolder text-white q-my-md line-height-tight">
            {{ $t('innovation.mobile.title') }}
          </h2>
          <p class="text-subtitle1 text-blue-2 q-mb-xl opacity-90 max-width-500">
            {{ $t('innovation.mobile.desc') }}
          </p>
          
          <div class="row q-col-gutter-md">
            <div v-for="(feat, fIdx) in $tm('innovation.mobile.features')" :key="fIdx" class="col-12">
              <div class="feature-item-pill card-glass-effect">
                <q-icon name="check_circle" color="amber-8" size="24px" class="q-mr-md" />
                <span class="text-body1 text-white opacity-90">{{ feat }}</span>
              </div>
            </div>
          </div>

          <div class="q-mt-xl row q-gutter-sm items-center">
             <div class="availability-chip">
              <q-icon name="home" size="18px" />
              <span>{{ $t('innovation.mobile.availability.home') }}</span>
            </div>
            <div class="availability-chip">
              <q-icon name="directions_car" size="18px" />
              <span>{{ $t('innovation.mobile.availability.travel') }}</span>
            </div>
            <div class="availability-chip highlight">
              <q-icon name="security" size="18px" />
              <span>{{ $t('innovation.mobile.availability.secure') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── 3D ROADMAP TIMELINE ──────────────────────────────── -->
    <div class="roadmap-3d-container q-mt-xl q-pb-xl overflow-hidden">
      <div class="text-h3 text-weight-bolder text-white text-center q-mb-xl animate-fade-in">
        {{ $t('innovation.timelineTitle') }}
      </div>

      <div class="roadmap-3d-scene">
        <div class="roadmap-path">
          <div
            v-for="(step, idx) in roadmapSteps"
            :key="idx"
            class="roadmap-milestone"
            :style="{ '--index': idx, '--total': roadmapSteps.length }"
          >
            <div class="milestone-disc shadow-24"></div>
            <div class="milestone-label-box" :class="idx % 2 === 0 ? 'label-left' : 'label-right'">
              <div class="milestone-number">{{ idx + 1 }}</div>
              <div class="milestone-title text-weight-bold">{{ step.title }}</div>
              <div class="milestone-caption">{{ step.caption }}</div>
            </div>
            <!-- Connection Line -->
            <div v-if="idx < roadmapSteps.length - 1" class="milestone-connector"></div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const pillars = computed(() => [
  {
    title: t('innovation.pillars.drafting.title'),
    icon: 'edit_note',
    colorClass: 'glow-blue',
    description: t('innovation.pillars.drafting.desc'),
    features: [
      t('innovation.pillars.drafting.features[0]'),
      t('innovation.pillars.drafting.features[1]'),
      t('innovation.pillars.drafting.features[2]'),
    ],
  },
  {
    title: t('innovation.pillars.voice.title'),
    icon: 'mic_external_on',
    colorClass: 'glow-purple',
    description: t('innovation.pillars.voice.desc'),
    features: [
      t('innovation.pillars.voice.features[0]'),
      t('innovation.pillars.voice.features[1]'),
      t('innovation.pillars.voice.features[2]'),
    ],
  },
  {
    title: t('innovation.pillars.analytics.title'),
    icon: 'insights',
    colorClass: 'glow-cyan',
    description: t('innovation.pillars.analytics.desc'),
    features: [
      t('innovation.pillars.analytics.features[0]'),
      t('innovation.pillars.analytics.features[1]'),
      t('innovation.pillars.analytics.features[2]'),
    ],
  },
  {
    title: t('innovation.pillars.agent.title'),
    icon: 'hub',
    colorClass: 'glow-amber',
    description: t('innovation.pillars.agent.desc'),
    features: [
      t('innovation.pillars.agent.features[0]'),
      t('innovation.pillars.agent.features[1]'),
      t('innovation.pillars.agent.features[2]'),
    ],
  },
  {
    title: t('innovation.pillars.deadline.title'),
    icon: 'notification_important',
    colorClass: 'glow-red',
    description: t('innovation.pillars.deadline.desc'),
    features: [
      t('innovation.pillars.deadline.features[0]'),
      t('innovation.pillars.deadline.features[1]'),
      t('innovation.pillars.deadline.features[2]'),
    ],
  },
  {
    title: t('innovation.pillars.search.title'),
    icon: 'language',
    colorClass: 'glow-green',
    description: t('innovation.pillars.search.desc'),
    features: [
      t('innovation.pillars.search.features[0]'),
      t('innovation.pillars.search.features[1]'),
      t('innovation.pillars.search.features[2]'),
    ],
  },
])

const roadmapSteps = computed(() => [
  { title: t('innovation.timeline.step1.title'), caption: t('innovation.timeline.step1.caption') },
  { title: t('innovation.timeline.step2.title'), caption: t('innovation.timeline.step2.caption') },
  { title: t('innovation.timeline.step3.title'), caption: t('innovation.timeline.step3.caption') },
  { title: t('innovation.timeline.step4.title'), caption: t('innovation.timeline.step4.caption') },
  { title: t('innovation.timeline.step5.title'), caption: t('innovation.timeline.step5.caption') },
])
</script>

<style lang="scss" scoped>
.innovation-page {
  background: radial-gradient(circle at top right, #001a4d 0%, #000b21 100%);
  min-height: 100vh;
}

.max-width-700 {
  max-width: 700px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.min-width-auto {
  min-width: auto;
}

.innovation-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 193, 7, 0.1);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.innovation-card {
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);

    .card-glow {
      opacity: 0.15;
    }
    .icon-box {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.icon-box {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  &.glow-blue {
    background: rgba(33, 150, 243, 0.1);
    color: #2196f3;
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.2);
  }
  &.glow-purple {
    background: rgba(156, 39, 176, 0.1);
    color: #9c27b0;
    box-shadow: 0 0 20px rgba(156, 39, 176, 0.2);
  }
  &.glow-cyan {
    background: rgba(0, 188, 212, 0.1);
    color: #00bcd4;
    box-shadow: 0 0 20px rgba(0, 188, 212, 0.2);
  }
  &.glow-amber {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.2);
  }
  &.glow-red {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
    box-shadow: 0 0 20px rgba(244, 67, 54, 0.2);
  }
  &.glow-green {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.2);
  }
}

.card-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 0;

  &.glow-blue {
    background: radial-gradient(circle at 50% 50%, #2196f3 0%, transparent 70%);
  }
  &.glow-purple {
    background: radial-gradient(circle at 50% 50%, #9c27b0 0%, transparent 70%);
  }
  &.glow-cyan {
    background: radial-gradient(circle at 50% 50%, #00bcd4 0%, transparent 70%);
  }
  &.glow-amber {
    background: radial-gradient(circle at 50% 50%, #ffc107 0%, transparent 70%);
  }
  &.glow-red {
    background: radial-gradient(circle at 50% 50%, #f44336 0%, transparent 70%);
  }
  &.glow-green {
    background: radial-gradient(circle at 50% 50%, #4caf50 0%, transparent 70%);
  }
}

.vision-banner {
  background: linear-gradient(135deg, rgba(0, 47, 108, 0.8) 0%, rgba(0, 26, 77, 0.8) 100%);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.security-banner {
  background: rgba(0, 11, 33, 0.65);
  border-radius: 32px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  backdrop-filter: blur(20px);
}

.security-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  
  &.highlight-border {
    border: 1px solid rgba(255, 193, 7, 0.4);
    background: rgba(255, 193, 7, 0.03);
  }
}

// ── Animations ───────────────────────────────────────────────
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease forwards;
}
.animate-card-pop {
  opacity: 0;
  animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: var(--delay);
}
.animate-slide-up {
  animation: fadeIn 1s ease forwards;
  animation-delay: 0.6s;
  opacity: 0;
}

// ── Themes ───────────────────────────────────────────────────
body.body--light .innovation-page {
  background: radial-gradient(circle at top right, #f4f7fc 0%, #e0e6ed 100%);
  .text-white {
    color: #002f6c !important;
  }
  .text-blue-2 {
    color: #004fa3 !important;
  }
  .text-blue-1 {
    color: #455a64 !important;
  }
  .innovation-card {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }
  .vision-banner {
    background: linear-gradient(135deg, #002f6c 0%, #0055a5 100%);
    .text-white {
      color: #fff !important;
    }
    .text-blue-2 {
      color: #e3f2fd !important;
    }
  }

  .security-banner {
    background: linear-gradient(135deg, #ffffff 0%, #f4f7fc 100%);
    border: 1px solid rgba(0, 47, 108, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

    .text-white {
      color: #002f6c !important;
    }
  }
  
  .security-card {
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.05);

    .text-white {
      color: #002f6c !important;
    }

    &.highlight-border {
      border: 1px solid rgba(255, 193, 7, 0.6);
      background: rgba(255, 193, 7, 0.05);
    }
  }
}

// ── 3D Roadmap Styles ────────────────────────────────────────
.roadmap-3d-container {
  perspective: 1500px;
  position: relative;
}

.roadmap-3d-scene {
  transform: rotateX(55deg) translateZ(0);
  transform-style: preserve-3d;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  height: 800px;
}

.roadmap-path {
  width: 40px;
  height: 100%;
  background: linear-gradient(
    to top,
    #ffc107 0%,
    #ff9800 20%,
    #e91e63 40%,
    #9c27b0 60%,
    #2196f3 80%,
    #00bcd4 100%
  );
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(255, 152, 0, 0.3);

  // Arrow Head (at top now)
  &::before {
    content: '';
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    border-bottom: 60px solid #00bcd4;
  }
}

.roadmap-milestone {
  position: absolute;
  top: calc((var(--total) - 1 - var(--index)) * 20%);
  left: 50%;
  transform: translateX(-50%);
  transform-style: preserve-3d;
  width: 100%;
}

.milestone-disc {
  width: 120px;
  height: 30px;
  background: white;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateZ(10px);
  background: radial-gradient(circle at 30% 30%, #fff 0%, #ddd 100%);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.milestone-label-box {
  position: absolute;
  top: 0;
  width: 280px;
  padding: 18px 28px;
  background: rgba(0, 11, 33, 0.65);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  // Significant tilt reduction for legibility
  transform: rotateX(-35deg) translateZ(60px);
  color: white;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);

  &:hover {
    background: rgba(0, 26, 77, 0.95);
    border-color: #f7941d;
    transform: rotateX(0deg) translateZ(100px) scale(1.1);
    z-index: 100;
  }

  &.label-left {
    right: 160px;
    text-align: right;
    border-right: 5px solid #f7941d;
  }

  &.label-right {
    left: 160px;
    text-align: left;
    border-left: 5px solid #00bcd4;
  }
}

.milestone-number {
  background: white;
  color: #001a4d;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  margin-bottom: 10px;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
}

.milestone-title {
  font-size: 1.5rem;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  font-weight: 800;
  margin-bottom: 4px;
}

.milestone-caption {
  font-size: 1.1rem;
  opacity: 1;
  color: #e3f2fd;
  font-weight: 500;
}

// ── Light Mode Fixes ─────────────────────────────────────────
body.body--light {
  .roadmap-3d-scene {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 40px;
  }

  .roadmap-milestone {
    .milestone-label-box {
      background: #ffffff;
      border: 1px solid rgba(0, 47, 108, 0.15);
      color: #002f6c;
      box-shadow: 0 15px 40px rgba(0, 47, 108, 0.2);

      &:hover {
        background: #f8f9fa;
        border-color: #f7941d;
      }

      .milestone-caption {
        color: #455a64;
      }
    }

    .milestone-number {
      background: #002f6c;
      color: white;
      box-shadow: 0 4px 10px rgba(0, 47, 108, 0.2);
    }

    .milestone-disc {
      background: radial-gradient(circle at 30% 30%, #fff 0%, #cbd5e0 100%);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
  }

  .roadmap-path {
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.15);
  }
}

@media (max-width: 768px) {
  .roadmap-3d-scene {
    transform: rotateX(45deg) scale(0.7);
  }
  .milestone-label-box {
    width: 180px;
    &.label-left {
      right: 80px;
    }
    &.label-right {
      left: 80px;
    }
  }
}

// ── Mobile Teaser Specific Styles ──────────────────────────
.mobile-teaser-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border-radius: 48px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 60%;
    height: 150%;
    background: radial-gradient(circle, rgba(255, 193, 7, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }
}

.mobile-mockup-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.phone-frame {
  width: 280px;
  height: 560px;
  background: #0d0d0d;
  border-radius: 44px;
  border: 12px solid #1a1a1a;
  position: relative;
  z-index: 2;
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.7);
  animation: floatPhone 6s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 6px;
    background: #222;
    border-radius: 10px;
  }
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #002f6c 0%, #000b21 100%);
  border-radius: 32px;
  position: relative;
}

.ai-glow-icon {
  color: #ffc107;
  filter: drop-shadow(0 0 30px rgba(255, 193, 7, 0.6));
  animation: pulseAi 4s ease-in-out infinite;
}

.feature-item-pill {
  background: rgba(255, 255, 255, 0.04);
  padding: 16px 28px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    background: rgba(255, 193, 7, 0.12);
    border-color: rgba(255, 193, 7, 0.4);
    transform: translateX(12px) scale(1.02);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
}

.availability-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(33, 150, 243, 0.08);
  color: #90caf9;
  padding: 10px 20px;
  border-radius: 24px;
  border: 1px solid rgba(33, 150, 243, 0.15);
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.3s ease;

  &.highlight {
    background: rgba(76, 175, 80, 0.1);
    color: #81c784;
    border-color: rgba(76, 175, 80, 0.2);
  }

  &:hover {
    transform: translateY(-3px);
    background: rgba(33, 150, 243, 0.15);
  }
}

.line-height-tight {
  line-height: 1.1;
}

.max-width-500 {
  max-width: 500px;
}

@keyframes floatPhone {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(3deg); }
}

@keyframes pulseAi {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

// Light mode overrides
body.body--light {
  .mobile-teaser-section {
    background: linear-gradient(135deg, #ffffff 0%, #f4f7fc 100%);
    border: 1px solid rgba(0, 47, 108, 0.1);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.05);
    .text-white { color: #002f6c !important; }
    .text-blue-2 { color: #455a64 !important; }
  }
  .feature-item-pill {
    background: white;
    border: 1px solid rgba(0, 47, 108, 0.08);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    .text-white { color: #002f6c !important; }
  }
  .availability-chip {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #bbdefb;
    &.highlight {
      background: #e8f5e9;
      color: #2e7d32;
      border-color: #c8e6c9;
    }
  }
}

@media (max-width: 768px) {
  .phone-frame {
    transform: scale(0.8);
    margin: 0 auto;
  }
  .mobile-teaser-section {
    padding: 30px 20px;
    text-align: center;
  }
  .feature-item-pill {
    justify-content: center;
    &:hover { transform: scale(1.05); }
  }
  .availability-chip {
    justify-content: center;
    width: 100%;
  }
}
</style>
