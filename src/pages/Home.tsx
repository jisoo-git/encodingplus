import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

function useLandingLinks() {
  const [links, setLinks] = useState<{ course1: string; course2: string }>({ course1: '', course2: '' })
  useEffect(() => {
    getDoc(doc(db, 'settings', 'landing'))
      .then(snap => { if (snap.exists()) setLinks(snap.data() as { course1: string; course2: string }) })
      .catch(() => {})
  }, [])
  return links
}

function ApplyButton({ formId, color }: { formId: string; color: 'blue' | 'indigo' }) {
  const navigate = useNavigate()

  if (!formId) {
    return (
      <button disabled className="px-5 py-2.5 rounded-xl font-semibold bg-white/20 text-white/50 cursor-not-allowed text-sm border border-white/20">
        신청 준비 중
      </button>
    )
  }

  const cls = color === 'blue'
    ? 'bg-white text-blue-700 hover:bg-blue-50 border border-white cursor-pointer'
    : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-white cursor-pointer'

  return (
    <button
      onClick={() => navigate(`/form/${formId}`)}
      className={`px-5 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm ${cls}`}
    >
      신청 폼으로 →
    </button>
  )
}

export default function Home() {
  const links = useLandingLinks()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-100">

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="text-blue-700 font-black text-xl">인코딩</span>
          <span className="font-black text-xl text-gray-900">플러스</span>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium cursor-pointer"
        >
          관리자
        </button>
      </header>

      {/* 히어로 */}
      <section className="bg-gradient-to-b from-slate-200 to-slate-100 px-6 py-12 text-center border-b border-slate-300">
        <p className="text-blue-700 font-semibold text-xs tracking-widest mb-2">2027학년도 디미고 입시</p>
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          합격을 위한 <span className="text-blue-700">단 하나의 선택</span>
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          특별전형부터 일반전형까지, 인코딩 플러스와 함께 준비하세요.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => document.getElementById('course-1')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            단기특강 보기
          </button>
          <button
            onClick={() => document.getElementById('course-2')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            일반전형 보기
          </button>
        </div>
      </section>

      {/* 코스 영역 */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">

        {/* 과정 1: 입시 단기특강 */}
        <div id="course-1" className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div className="bg-slate-800 px-5 py-4">
            <p className="text-blue-400 font-semibold text-xs mb-0.5">COURSE 01 · 16주 과정</p>
            <h2 className="text-xl font-black text-white">입시 단기특강</h2>
            <p className="text-slate-400 text-xs mt-0.5">특별전형 + 일반전형 병행 전략</p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* 월별 커리큘럼 */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">월별 커리큘럼</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { month: '7월', content: '주제 선정\n코딩 수학' },
                  { month: '8월', content: '실적물 제작\n수학 실전' },
                  { month: '9월', content: '이론 수업\n정보 학습' },
                  { month: '10월', content: '자료 준비\n모의고사' },
                ].map(({ month, content }) => (
                  <div key={month} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p className="text-blue-700 font-bold text-xs mb-1">{month}</p>
                    <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">{content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 영역별 */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">영역별 학습</p>
              <div className="space-y-1.5">
                {[
                  { area: '특전 대비', desc: '실적물 작업 · 이론 교육' },
                  { area: '일전 대비', desc: '코딩 수학 · 정보 교육' },
                  { area: '논술 대비', desc: '자소서 · 실적설명서 · 면접' },
                ].map(({ area, desc }) => (
                  <div key={area} className="flex items-center gap-3 py-2 px-4 bg-slate-50 border border-gray-200 rounded-lg">
                    <span className="text-xs font-bold text-blue-700 w-16 shrink-0">{area}</span>
                    <span className="text-xs text-gray-600">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 시간표 */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">수업 시간</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { day: '매주 토요일', time: '12:00 – 18:00', note: '대면 6시간' },
                  { day: '매주 수요일', time: '저녁 1시간', note: '비대면 · 보충 불가' },
                ].map(({ day, time, note }) => (
                  <div key={day} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-700">{day}</p>
                    <p className="text-sm font-black text-gray-900 mt-0.5">{time}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-blue-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-xs mb-0.5">월 수강료</p>
                <p className="text-3xl font-black text-white">73<span className="text-lg font-bold">만원</span></p>
              </div>
              <ApplyButton formId={links.course1} color="blue" />
            </div>
          </div>
        </div>

        {/* 과정 2: 일반전형 특강 */}
        <div id="course-2" className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div className="bg-slate-800 px-5 py-4">
            <p className="text-indigo-400 font-semibold text-xs mb-0.5">COURSE 02 · 16주 과정</p>
            <h2 className="text-xl font-black text-white">일반전형 특강</h2>
            <p className="text-slate-400 text-xs mt-0.5">일반전형 집중 전략</p>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* 수업 구성 */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">수업 구성</p>
              <div className="space-y-1.5">
                {[
                  { area: '코딩 수학', desc: '정보 교육 중심의 수학 학습' },
                  { area: '정보 교육', desc: '디미고 일반전형 대비 이론' },
                  { area: '면접 대비', desc: '자기소개서 · 구술 준비' },
                ].map(({ area, desc }) => (
                  <div key={area} className="flex items-center gap-3 py-2 px-4 bg-slate-50 border border-gray-200 rounded-lg">
                    <span className="text-xs font-bold text-indigo-700 w-16 shrink-0">{area}</span>
                    <span className="text-xs text-gray-600">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 시간표 */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">수업 시간</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { day: '토 또는 일요일', time: '15:00 – 18:00', note: '대면 3시간' },
                  { day: '매주 수요일', time: '저녁 1시간', note: '비대면 · 보충 불가' },
                ].map(({ day, time, note }) => (
                  <div key={day} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-700">{day}</p>
                    <p className="text-sm font-black text-gray-900 mt-0.5">{time}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">월 수강료</p>
                <p className="text-3xl font-black text-white">48<span className="text-lg font-bold">만원</span></p>
              </div>
              <ApplyButton formId={links.course2} color="indigo" />
            </div>
          </div>
        </div>

        {/* 비교 */}
        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-800 text-xs font-bold px-4 py-2.5">
            <span className="text-slate-400">구분</span>
            <span className="text-center text-blue-400">단기특강</span>
            <span className="text-center text-indigo-400">일반전형</span>
          </div>
          {[
            { label: '대상', v1: '특별+일반전형', v2: '일반전형만' },
            { label: '주간 수업', v1: '7시간', v2: '4시간' },
            { label: '수업 기간', v1: '16주', v2: '16주' },
            { label: '월 수강료', v1: '73만원', v2: '48만원' },
          ].map(({ label, v1, v2 }, i) => (
            <div key={label} className={`grid grid-cols-3 px-4 py-3 border-b border-gray-200 last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <span className="text-gray-600 text-xs font-semibold">{label}</span>
              <span className="text-center text-gray-900 font-bold text-xs">{v1}</span>
              <span className="text-center text-gray-900 font-bold text-xs">{v2}</span>
            </div>
          ))}
        </div>

      </div>

      {/* 푸터 */}
      <footer className="bg-slate-900 text-slate-400 px-6 py-5 text-center text-xs mt-2">
        <p className="font-bold text-white text-sm mb-0.5">인코딩 플러스</p>
        <p>2027학년도 디미고 입시 전문</p>
      </footer>
    </div>
  )
}
