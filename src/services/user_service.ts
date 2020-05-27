class UserService {
  static getUserByUsername(username: string) {
    return {
      "user": {
        "email": "user1",
        "token": "jwt.token.here",
        "username": "user1",
        "bio": "I am a developer.",
        "image": null
      }
    }
  }

  static getUserProfileByUsername(username: string) {
    return {
      "profile": {
        "email": "user1",
        "token": "jwt.token.here",
        "username": "user1",
        "bio": "I am a developer.",
        "image": null
      }
    }
  }
}

export default UserService;
