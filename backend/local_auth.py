"""
Local JWT Authentication utilities
"""

import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
import logging

def generate_token(user_id, email):
    """
    Generate JWT token for authenticated user
    """
    try:
        payload = {
            'user_id': user_id,
            'email': email,
            'exp': datetime.utcnow() + timedelta(days=1),  # Token expires in 1 day
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return token
    except Exception as e:
        logging.error(f"Error generating token: {e}")
        return None

def verify_token(token):
    """
    Verify JWT token and return user info
    """
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return {
            'user_id': payload['user_id'],
            'email': payload['email'],
            'exp': payload['exp'],
            'iat': payload['iat']
        }
    except jwt.ExpiredSignatureError:
        logging.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logging.warning(f"Invalid token: {e}")
        return None
    except Exception as e:
        logging.error(f"Error verifying token: {e}")
        return None

def jwt_required(f):
    """
    Decorator to require JWT authentication for routes
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header missing'}), 401
        
        # Extract token from "Bearer <token>" format
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Verify the token
        user_info = verify_token(token)
        
        if not user_info:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request context
        request.current_user = user_info
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """
    Get current authenticated user from request context
    """
    return getattr(request, 'current_user', None)
