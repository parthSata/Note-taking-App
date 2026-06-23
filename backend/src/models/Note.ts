import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface INote extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

NoteSchema.index({ userId: 1, createdAt: -1 });

export const Note: Model<INote> =
  mongoose.models.Note ?? mongoose.model<INote>('Note', NoteSchema);
