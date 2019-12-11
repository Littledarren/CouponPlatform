'use strict'

class CodedError extends Error {
  constructor (message, code = -1) {
    super(message)
    this.code = code
  }
}

module.exports = {
  /**
   * 带有错误代码的错误类
   */
  CodedError,
  /**
   * 身份验证错（401）
   */
  AuthorizationError: class AuthorizationError extends CodedError {
    constructor (message) {
      super(message, 401)
    }
  },

  /**
   * 拒绝访问 (403)
   */
  ForbiddenError: class ForbiddenError extends CodedError {
    constructor (message) {
      super(message, 403)
    }
  },
  /**
   * 无效的用户输入 (400)
   */
  InvalidUserInputError: class InvalidUserInputError extends CodedError {
    constructor (message) {
      super(message, 400)
    }
  },
  /**
   * 找不到所请求的资源错误（404）
   */
  NotFoundError: class NotFoundError extends CodedError {
    constructor (message) {
      super(message, 404)
    }
  },
  /**
   * 未抢到优惠券错误(204)
   */
  CannotGetCouponError: class CannotGetCouponError extends CodedError {
    constructor (message) {
      super(message, 204)
    }
  }
}
