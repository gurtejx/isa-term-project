import mongoose from "mongoose";
import { DatabaseClient } from "./database_client.js";

class MongoService {
  constructor() {
    if (!MongoService.instance) {
      this._conn = new DatabaseClient();
      this.models = {};
      this.create_schemas();

      MongoService.instance = this;
    }

    return MongoService.instance;
  }

  /**
   * Create MongoDB schemas for User.
   */
  create_schemas() {
    // user schema
    const userSchema = new mongoose.Schema({
      firstname: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        default: "user",
      },
      num_api_calls: {
        type: Number,
        default: 0,
      }
    });
    this.models.User = mongoose.model("User", userSchema);
  }
}

export default MongoService;
