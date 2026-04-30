import { of } from 'rxjs'

jest.mock('./practice.model', () => ({ NSPractice: {} }), { virtual: true })
jest.mock('lodash', () => {
  const indexOf = (arr: any[], val: any) => arr.indexOf(val)
  return { __esModule: true, default: { indexOf }, indexOf }
}, { virtual: true })

// Mock window.location before module import
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: 'http://localhost/viewer?editMode=false' },
})

import { PracticeService } from './practice.service'

describe('PracticeService', () => {
  let service: PracticeService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({})),
      post: jest.fn().mockReturnValue(of({})),
    }
    service = new PracticeService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('BehaviorSubjects initial values', () => {
    it('paperSections starts null', () => {
      expect(service.paperSections.getValue()).toBeNull()
    })
    it('questionAnswerHash starts empty', () => {
      expect(service.questionAnswerHash.getValue()).toEqual({})
    })
    it('secAttempted starts empty array', () => {
      expect(service.secAttempted.getValue()).toEqual([])
    })
    it('displayCorrectAnswer starts false', () => {
      expect(service.displayCorrectAnswer.getValue()).toBe(false)
    })
  })

  describe('shCorrectAnswer', () => {
    it('updates displayCorrectAnswer to true', () => {
      service.shCorrectAnswer(true)
      expect(service.displayCorrectAnswer.getValue()).toBe(true)
    })
    it('updates displayCorrectAnswer to false', () => {
      service.shCorrectAnswer(false)
      expect(service.displayCorrectAnswer.getValue()).toBe(false)
    })
  })

  describe('qAnsHash', () => {
    it('updates questionAnswerHash', () => {
      service.qAnsHash({ q1: ['a'] })
      expect(service.questionAnswerHash.getValue()).toEqual({ q1: ['a'] })
    })
  })

  describe('startSection', () => {
    it('marks section as attempted', () => {
      service.secAttempted.next([
        { identifier: 'sec1', isAttempted: false, fullAttempted: false },
      ] as any)
      service.startSection({ identifier: 'sec1' } as any)
      const sections = service.secAttempted.getValue()
      expect(sections[0].isAttempted).toBe(true)
      expect(sections[0].fullAttempted).toBe(false)
    })

    it('does nothing for null section', () => {
      expect(() => service.startSection(null as any)).not.toThrow()
    })
  })

  describe('setFullAttemptSection', () => {
    it('marks section as fully attempted', () => {
      service.secAttempted.next([
        { identifier: 'sec1', isAttempted: false, fullAttempted: false },
      ] as any)
      service.setFullAttemptSection({ identifier: 'sec1' } as any)
      const sections = service.secAttempted.getValue()
      expect(sections[0].isAttempted).toBe(true)
      expect(sections[0].fullAttempted).toBe(true)
    })

    it('does nothing for null section', () => {
      expect(() => service.setFullAttemptSection(null as any)).not.toThrow()
    })
  })

  describe('submitQuizV2', () => {
    it('posts to ASSESSMENT_SUBMIT_V2', done => {
      const req: any = { questions: [] }
      mockHttp.post.mockReturnValue(of({ result: 'ok' }))
      service.submitQuizV2(req).subscribe(_ => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/apis/protected/v8/user/evaluate/assessment/submit/v2', req)
        done()
      })
    })
  })

  describe('submitQuizV3', () => {
    it('posts and maps result', done => {
      const req: any = {}
      mockHttp.post.mockReturnValue(of({ result: { score: 80 } }))
      service.submitQuizV3(req).subscribe(result => {
        expect(result).toEqual({ score: 80 })
        done()
      })
    })
  })

  describe('submitQuizV4', () => {
    it('posts to ASSESSMENT_SUBMIT_V4', done => {
      mockHttp.post.mockReturnValue(of({ data: 'ok' }))
      service.submitQuizV4({} as any).subscribe(result => {
        expect(result).toEqual({ data: 'ok' })
        done()
      })
    })
  })

  describe('submitQuizV5', () => {
    it('posts to ASSESSMENT_SUBMIT_V5', done => {
      mockHttp.post.mockReturnValue(of({ data: 'ok' }))
      service.submitQuizV5({} as any).subscribe(result => {
        expect(result).toEqual({ data: 'ok' })
        done()
      })
    })
  })

  describe('submitQuizV6', () => {
    it('posts to ASSESSMENT_SUBMIT_V6', done => {
      mockHttp.post.mockReturnValue(of({ data: 'ok' }))
      service.submitQuizV6({} as any).subscribe(result => {
        expect(result).toEqual({ data: 'ok' })
        done()
      })
    })
  })

  describe('submitQuizV7', () => {
    it('posts to ASSESSMENT_SUBMIT_V7', done => {
      mockHttp.post.mockReturnValue(of({ data: 'ok' }))
      service.submitQuizV7({} as any).subscribe(result => {
        expect(result).toEqual({ data: 'ok' })
        done()
      })
    })
  })

  describe('publicV4Submit', () => {
    it('posts to PUBLIC_ASSESSMENT_V4_SUBMIT', done => {
      mockHttp.post.mockReturnValue(of({ data: 'ok' }))
      service.publicV4Submit({} as any).subscribe(_ => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'api/public/assessment/v4/assessment/submit', {})
        done()
      })
    })
  })

  describe('publicV5Submit', () => {
    it('posts to PUBLIC_ASSESSMENT_SUBMIT', done => {
      mockHttp.post.mockReturnValue(of({ data: 'ok' }))
      service.publicV5Submit({} as any).subscribe(_ => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'api/public/assessment/v5/assessment/submit', {})
        done()
      })
    })
  })

  describe('quizResult', () => {
    it('uses ASSESSMENT_RESULT_V4 when not forPreview', done => {
      mockHttp.post.mockReturnValue(of({ result: {} }))
      service.quizResult({ id: 'a1' }).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/user/assessment/v4/result', { id: 'a1' })
        done()
      })
    })
    it('uses PUBLIC_ASSESSMENT_V4_RESULT when forPreview=true', done => {
      mockHttp.post.mockReturnValue(of({ result: {} }))
      service.quizResult({ id: 'a1' }, true).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'api/public/assessment/v5/result', { id: 'a1' })
        done()
      })
    })
  })

  describe('quizResultV5', () => {
    it('uses ASSESSMENT_RESULT_V5 when not forPreview', done => {
      mockHttp.post.mockReturnValue(of({}))
      service.quizResultV5({}).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/user/assessment/v5/result', {})
        done()
      })
    })
    it('uses PUBLIC_ASSESSMENT_RESULT when forPreview=true', done => {
      mockHttp.post.mockReturnValue(of({}))
      service.quizResultV5({}, true).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'api/public/assessment/v5/result', {})
        done()
      })
    })
  })

  describe('quizResultV7', () => {
    it('uses ASSESSMENT_RESULT_V7 when not forPreview', done => {
      mockHttp.post.mockReturnValue(of({}))
      service.quizResultV7({}).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/user/assessment/v7/result', {})
        done()
      })
    })
    it('uses PUBLIC_ASSESSMENT_RESULT when forPreview=true', done => {
      mockHttp.post.mockReturnValue(of({}))
      service.quizResultV7({}, true).subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'api/public/assessment/v5/result', {})
        done()
      })
    })
  })

  describe('canAttend', () => {
    it('calls GET for valid identifier', done => {
      mockHttp.get.mockReturnValue(of({ result: { attemptsMade: 1, attemptsAllowed: 3 } }))
      service.canAttend('do_123').subscribe(result => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/apis/proxies/v8/user/assessment/retake/do_123')
        expect(result).toEqual({ attemptsMade: 1, attemptsAllowed: 3 })
        done()
      })
    })

    it('returns default when identifier is empty', done => {
      service.canAttend('').subscribe(result => {
        expect(result).toEqual({ attemptsMade: 0, attemptsAllowed: 1 })
        done()
      })
    })
  })

  describe('canAttendV5', () => {
    it('calls GET for valid identifier', done => {
      mockHttp.get.mockReturnValue(of({ result: { attemptsMade: 2, attemptsAllowed: 5 } }))
      service.canAttendV5('do_456').subscribe(_ => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/apis/proxies/v8/user/assessment/v5/retake/do_456')
        done()
      })
    })

    it('returns default for empty identifier', done => {
      service.canAttendV5('').subscribe(result => {
        expect(result).toEqual({ attemptsMade: 0, attemptsAllowed: 1 })
        done()
      })
    })
  })

  describe('canAttendV7', () => {
    it('calls GET for valid identifier', done => {
      mockHttp.get.mockReturnValue(of({ result: { attemptsMade: 0, attemptsAllowed: 2 } }))
      service.canAttendV7('do_789').subscribe(_ => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/apis/proxies/v8/user/assessment/v7/retake/do_789')
        done()
      })
    })

    it('returns default for empty identifier', done => {
      service.canAttendV7('').subscribe(result => {
        expect(result).toEqual({ attemptsMade: 0, attemptsAllowed: 1 })
        done()
      })
    })
  })

  describe('saveAndNextQuestion', () => {
    it('posts to SAVE_AND_NEXT_QUESTION', done => {
      mockHttp.post.mockReturnValue(of({ data: 'saved' }))
      service.saveAndNextQuestion({} as any).subscribe(_ => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'apis/proxies/v8/assessment/save', {})
        done()
      })
    })
  })

  describe('getSection', () => {
    it('uses normal GET when no forPreview', done => {
      mockHttp.get.mockReturnValue(of({ sections: [] }))
      service.getSection('sec1', false, undefined, 'col1').subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/apis/proxies/v8/assessment/v5/read/sec1?parentContextId=col1')
        done()
      })
    })

    it('uses POST when forPreview=true', done => {
      mockHttp.post.mockReturnValue(of({ sections: [] }))
      service.getSection('sec1', true, { data: 'req' }, 'col1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'api/public/assessment/v5/read', { data: 'req' })
        done()
      })
    })
  })

  describe('getSectionV4', () => {
    it('uses normal GET when no forPreview', done => {
      mockHttp.get.mockReturnValue(of({ sections: [] }))
      service.getSectionV4('sec1', false, undefined, 'col1').subscribe(() => {
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/apis/proxies/v8/assessment/read/sec1?parentContextId=col1')
        done()
      })
    })

    it('uses POST when forPreview=true', done => {
      mockHttp.post.mockReturnValue(of({ sections: [] }))
      service.getSectionV4('sec1', true, { data: 'req' }, 'col1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          'api/public/assessment/v5/read', { data: 'req' })
        done()
      })
    })
  })

  describe('getQuestions', () => {
    it('posts to QUESTION_PAPER_QUESTIONS for normal mode', done => {
      mockHttp.post.mockReturnValue(of({ count: 2, questions: [] }))
      service.getQuestions(['q1', 'q2'], 'a1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/question/v5/read',
          expect.objectContaining({ assessmentId: 'a1' }))
        done()
      })
    })

    it('posts to PUBLIC_QUESTION_LIST when forPreview=true', done => {
      mockHttp.post.mockReturnValue(of({ count: 1, questions: [] }))
      service.getQuestions(['q1'], 'a1', true, {}, 'col1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/api/public/assessment/v5/question/list',
          expect.objectContaining({ assessmentIdentifier: 'a1' }))
        done()
      })
    })
  })

  describe('getQuestionsV4', () => {
    it('posts to QUESTION_PAPER_QUESTIONS_V4 for normal mode', done => {
      mockHttp.post.mockReturnValue(of({ count: 2, questions: [] }))
      service.getQuestionsV4(['q1'], 'a1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/apis/proxies/v8/question/read',
          expect.objectContaining({ assessmentId: 'a1' }))
        done()
      })
    })

    it('posts to PUBLIC_QUESTION_V4_LIST when forPreview=true', done => {
      mockHttp.post.mockReturnValue(of({ count: 1, questions: [] }))
      service.getQuestionsV4(['q1'], 'a1', true, {}, 'col1').subscribe(() => {
        expect(mockHttp.post).toHaveBeenCalledWith(
          '/api/public/assessment/v5/question/list',
          expect.objectContaining({ assessmentIdentifier: 'a1' }))
        done()
      })
    })
  })

  describe('shuffle', () => {
    it('returns array of same length', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = service.shuffle([...arr])
      expect(result).toHaveLength(arr.length)
    })

    it('contains same elements', () => {
      const arr = ['a', 'b', 'c']
      const result = service.shuffle([...arr]) as string[]
      expect(result.sort()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('extractContent', () => {
    it('extracts text from HTML', () => {
      const result = service.extractContent('<b>Hello World</b>')
      expect(result).toBe('Hello World')
    })

    it('replaces non-breaking spaces with regular spaces', () => {
      const result = service.extractContent('Hello\u00A0World')
      expect(result).toBe('Hello World')
    })
  })

  describe('sanitizeAssessmentSubmitRequest', () => {
    it('clears question and option text', () => {
      const req: any = {
        questions: [
          {
            question: 'What is 2+2?',
            questionType: 'mcq-sca',
            options: [{ hint: 'hint1', text: 'Four' }, { hint: '', text: 'Five' }],
          },
        ],
      }
      const result = service.sanitizeAssessmentSubmitRequest(req)
      expect(result.questions[0].question).toBe('')
      expect(result.questions[0].options[0].hint).toBe('')
      expect(result.questions[0].options[0].text).toBe('')
    })

    it('preserves option text for ftb questions', () => {
      const req: any = {
        questions: [
          {
            question: 'Fill in the blank',
            questionType: 'ftb',
            options: [{ hint: 'h', text: 'blank' }],
          },
        ],
      }
      const result = service.sanitizeAssessmentSubmitRequest(req)
      expect(result.questions[0].options[0].text).toBe('blank')
    })

    it('preserves option text for mtf questions', () => {
      const req: any = {
        questions: [
          {
            question: 'Match',
            questionType: 'mtf',
            options: [{ hint: 'h', text: 'item1' }],
          },
        ],
      }
      const result = service.sanitizeAssessmentSubmitRequest(req)
      expect(result.questions[0].options[0].text).toBe('item1')
    })
  })

  describe('createAssessmentSubmitRequest', () => {
    it('sets userSelected based on questionAnswerHash for mcq-sca', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q1',
          questionType: 'mcq-sca',
          options: [
            { optionId: 'opt1', userSelected: false },
            { optionId: 'opt2', userSelected: false },
          ],
        }],
      }
      const result = service.createAssessmentSubmitRequest(
        'do_123', 'Test Quiz', quiz, { q1: ['opt1'] }, {})
      expect(result.questions[0].options[0].userSelected).toBe(true)
      expect(result.questions[0].options[1].userSelected).toBe(false)
    })

    it('sets response for ftb questions', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q2',
          questionType: 'ftb',
          options: [{ optionId: 'opt1', response: '' }],
        }],
      }
      const result = service.createAssessmentSubmitRequest(
        'do_123', 'FTB Quiz', quiz, { q2: ['answer1'] }, {})
      expect(result.questions[0].options[0].response).toBe('answer1')
    })

    it('handles undefined questionType as mcq-sca', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q3',
          questionType: undefined,
          options: [{ optionId: 'a', userSelected: false }],
        }],
      }
      const result = service.createAssessmentSubmitRequest(
        'do_123', 'Quiz', quiz, {}, {})
      expect(result.questions[0].options[0].userSelected).toBe(false)
    })

    it('handles mcq-mca questionType', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q4',
          questionType: 'mcq-mca',
          options: [
            { optionId: 'a', userSelected: false },
            { optionId: 'b', userSelected: false },
          ],
        }],
      }
      const result = service.createAssessmentSubmitRequest(
        'do_123', 'MCA Quiz', quiz, { q4: ['a', 'b'] }, {})
      expect(result.questions[0].options[0].userSelected).toBe(true)
      expect(result.questions[0].options[1].userSelected).toBe(true)
    })

    it('sets identifier and title on returned request', () => {
      const quiz: any = { questions: [] }
      const result = service.createAssessmentSubmitRequest(
        'id_abc', 'My Title', quiz, {}, {})
      expect(result.identifier).toBe('id_abc')
      expect(result.title).toBe('My Title')
    })

    it('handles mcq-mca-w questionType', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q5',
          questionType: 'mcq-mca-w',
          options: [{ optionId: 'a', userSelected: false }, { optionId: 'b', userSelected: false }],
        }],
      }
      const result = service.createAssessmentSubmitRequest('id', 'T', quiz, { q5: ['a'] }, {})
      expect(result.questions[0].options[0].userSelected).toBe(true)
    })

    it('handles mcq-sca-tf questionType', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q6',
          questionType: 'mcq-sca-tf',
          options: [{ optionId: 'true', userSelected: false }],
        }],
      }
      const result = service.createAssessmentSubmitRequest('id', 'T', quiz, { q6: ['true'] }, {})
      expect(result.questions[0].options[0].userSelected).toBe(true)
    })

    it('handles ftb when no answer in hash (response stays undefined)', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q7',
          questionType: 'ftb',
          options: [{ optionId: '0', response: '' }],
        }],
      }
      const result = service.createAssessmentSubmitRequest('id', 'T', quiz, {}, {})
      expect(result.questions[0].options[0].response).toBe('')
    })

    it('handles mtf question when source matches option text', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q8',
          questionType: 'mtf',
          rhsChoices: ['Match A', 'Match B'],
          options: [
            { text: 'Source 1', response: '', userSelected: false },
            { text: 'Source 2', response: '', userSelected: false },
          ],
        }],
      }
      const mtfSrc = {
        q8: {
          source: ['Source 1', 'Source 2'],
          target: ['Target1', 'Target2'],
        },
      }
      const result = service.createAssessmentSubmitRequest('id', 'T', quiz, {}, mtfSrc)
      // The MTF option with matched source should be processed
      expect(result.questions[0]).toBeDefined()
    })

    it('handles mtf question when source does not match (response cleared)', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q9',
          questionType: 'mtf',
          rhsChoices: ['Match A'],
          options: [
            { text: 'No Match', response: 'old', userSelected: true },
          ],
        }],
      }
      const mtfSrc = {
        q9: { source: ['Different Source'], target: ['Target'] },
      }
      const result = service.createAssessmentSubmitRequest('id', 'T', quiz, {}, mtfSrc)
      expect(result.questions[0].options[0].response).toBe('')
    })

    it('handles mtf when no mtfSrc for question (response cleared)', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q10',
          questionType: 'mtf',
          rhsChoices: ['A'],
          options: [{ text: 'Text', response: 'old', userSelected: true }],
        }],
      }
      const result = service.createAssessmentSubmitRequest('id', 'T', quiz, {}, {})
      expect(result.questions[0].options[0].response).toBe('')
    })

    it('handles mtf with target that has no lastChar (targetId empty)', () => {
      const quiz: any = {
        questions: [{
          questionId: 'q11',
          questionType: 'mtf',
          rhsChoices: ['Match A'],
          options: [{ text: 'Source X', response: '', userSelected: false }],
        }],
      }
      const mtfSrc = {
        q11: { source: ['Source X'], target: [''] },
      }
      const result = service.createAssessmentSubmitRequest('id', 'T', quiz, {}, mtfSrc)
      expect(result.questions[0].options[0].userSelected).toBe(false)
    })
  })

  describe('currentSection BehaviorSubject', () => {
    it('starts with empty object', () => {
      expect(service.currentSection.getValue()).toEqual({})
    })
  })

  describe('mtfSrc BehaviorSubject', () => {
    it('starts with empty object', () => {
      expect(service.mtfSrc.getValue()).toEqual({})
    })
    it('can be updated', () => {
      service.mtfSrc.next({ q1: { source: ['a'], target: ['b'] } } as any)
      expect(service.mtfSrc.getValue()).toEqual({ q1: { source: ['a'], target: ['b'] } })
    })
  })

  describe('checkAlreadySubmitAssessment / clearResponse Subjects', () => {
    it('checkAlreadySubmitAssessment emits values', done => {
      service.checkAlreadySubmitAssessment.subscribe(v => {
        expect(v).toBe('test')
        done()
      })
      service.checkAlreadySubmitAssessment.next('test')
    })

    it('clearResponse emits values', done => {
      service.clearResponse.subscribe(v => {
        expect(v).toBe(42)
        done()
      })
      service.clearResponse.next(42 as any)
    })
  })
})
