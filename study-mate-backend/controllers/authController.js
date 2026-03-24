import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function register(req, res) {
    const { name, email, password, passwordConfirm } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    const emailNormalized = email.toLowerCase().trim();

    if (password !== passwordConfirm) {
        return res.status(400).json({
            success: false,
            error: 'Passwords do not match'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password is too short'
        });
    }

    try {
        const existingUser = await User.findOne({ email: emailNormalized });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name.trim(),
            email: emailNormalized,
            passwordHash
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const userPayload = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        };
        return res.status(201).json({
            success: true,
            accessToken: token,
            user: userPayload
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    const emailNormalized = email.toLowerCase().trim();

    try {
        const user = await User.findOne({ email: emailNormalized });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const userPayload = {
            id: user._id,
            name: user.name,
            email: user.email
        };
        res.json({
            success: true,
            accessToken: token,
            user: userPayload
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
}

export async function refresh(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        const user = await User.findById(decoded.id).select('name email');
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }
        const newToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        const userPayload = { id: user._id, name: user.name, email: user.email };
        return res.json({
            success: true,
            accessToken: newToken,
            user: userPayload
        });
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Token invalid' });
    }
}

export async function logout(req, res) {
    return res.status(200).json({ success: true });
}