import Note from '../models/Note.js';

export async function getNotes(req, res) {
    try {
        const notes = await Note
            .find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: notes
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

export async function getNoteById(req, res) {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

export async function createNote(req, res) {
    try {
        const { title, content } = req.body;

        const newNote = new Note({
            userId: req.user.id,
            title,
            content
        });

        await newNote.save();

        res.status(201).json({
            success: true,
            data: newNote
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

export async function updateNote(req, res) {
    try {
        const { title, content } = req.body;

        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        note.title = title || note.title;
        note.content = content || note.content;

        await note.save();

        res.json({
            success: true,
            data: note
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

export async function deleteNote(req, res) {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        res.json({
            success: true,
            data: { message: 'Note removed' }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}