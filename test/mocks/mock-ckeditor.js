// Mock for @ckeditor and @sunbird-cb/discussion-v2
module.exports = {
  ClassicEditor: jest.fn(),
  InlineEditor: jest.fn(),
  BalloonEditor: jest.fn(),
  DecoupledEditor: jest.fn(),
  Editor: jest.fn(),
  default: jest.fn(),
  DiscussionService: jest.fn(),
  DiscussionComponent: jest.fn(),
}
