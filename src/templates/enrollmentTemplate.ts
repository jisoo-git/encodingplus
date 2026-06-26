import type { Form } from '../types'

const id = () => crypto.randomUUID()

export function createEnrollmentTemplate(): Omit<Form, 'id' | 'createdAt'> {
  const sec1 = id(), sec2 = id(), sec3 = id(), sec4 = id()

  return {
    title: '수강신청 폼',
    description: '',
    type: 'enrollment',
    isActive: false,
    sections: [
      {
        id: sec1,
        title: '신청 확인',
        questions: [
          {
            id: id(),
            type: 'info',
            label: '수강신청 시 입력하신 개인정보(이름, 연락처, 학교 등)는 수업 운영 및 안내 목적으로만 사용되며, 제3자에게 제공되지 않습니다.',
            required: false,
          },
          {
            id: id(),
            type: 'radio',
            label: '개인정보 활용에 동의하십니까?',
            required: true,
            options: ['네', '아니오'],
          },
          {
            id: id(),
            type: 'radio',
            label: '원하시는 수업을 선택해 주세요',
            required: true,
            options: ['입시 단기특강', '일반전형 특강'],
            branching: {
              '입시 단기특강': sec3,
              '일반전형 특강': sec4,
            },
          },
        ],
      },
      {
        id: sec2,
        title: '유의사항',
        questions: [
          {
            id: id(),
            type: 'info',
            label: '수업 개설 기준: 수업은 최소 2명 이상 등록 시 개설됩니다. 인원 미달 시 개별 안내 후 환불 처리됩니다.',
            required: false,
          },
          {
            id: id(),
            type: 'info',
            label: '결석·보충 안내: 수요일 비대면 수업은 보충이 불가합니다. 대면 수업은 1회에 한해 사전 연락 후 보충 가능합니다.',
            required: false,
          },
          {
            id: id(),
            type: 'info',
            label: '수강료 납부: 수강료는 매월 첫 수업 전까지 납부해 주세요. 미납 시 수업 참여가 제한될 수 있습니다.',
            required: false,
          },
          {
            id: id(),
            type: 'info',
            label: '환불 규정: 수강 취소는 개강 1주일 전까지 전액 환불 가능합니다. 이후 취소 시 이미 진행된 수업 횟수에 따라 차등 환불됩니다.',
            required: false,
          },
        ],
      },
      {
        id: sec3,
        title: '입시 단기특강',
        questions: [
          { id: id(), type: 'short', label: '학생의 이름', required: true },
          { id: id(), type: 'short', label: '부모님 전화번호', required: true },
          { id: id(), type: 'short', label: '학교 (예: 양지중)', required: true },
          { id: id(), type: 'radio', label: '학생의 성별', required: true, options: ['남', '여'] },
          { id: id(), type: 'short', label: '학생의 생년월일 (6자리, 예: 080703)', required: true },
          { id: id(), type: 'short', label: '학생 전화번호 (예: 010-1234-5678)', required: true },
          {
            id: id(),
            type: 'radio',
            label: '비대면 수업시간 선택 (매주 수요일)',
            required: true,
            options: ['수요일 오후 10시 ~ 11시', '수요일 오후 11시 ~ 12시'],
          },
        ],
      },
      {
        id: sec4,
        title: '일반전형 특강',
        questions: [
          { id: id(), type: 'short', label: '학생의 이름', required: true },
          { id: id(), type: 'short', label: '부모님 전화번호', required: true },
          { id: id(), type: 'short', label: '학교 (예: 양지중)', required: true },
          { id: id(), type: 'radio', label: '학생의 성별', required: true, options: ['남', '여'] },
          { id: id(), type: 'short', label: '학생의 생년월일 (6자리, 예: 080703)', required: true },
          { id: id(), type: 'short', label: '학생 전화번호 (예: 010-1234-5678)', required: true },
          {
            id: id(),
            type: 'radio',
            label: '수업요일 선택',
            required: true,
            options: ['토요일 오후 3시 ~ 오후 6시', '일요일 오후 3시 ~ 오후 6시'],
          },
          {
            id: id(),
            type: 'radio',
            label: '비대면 수업시간 선택 (매주 수요일)',
            required: true,
            options: ['수요일 오후 10시 ~ 11시', '수요일 오후 11시 ~ 12시'],
          },
        ],
      },
    ],
  }
}
