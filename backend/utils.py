import hashlib

def compute_transaction_hash(tx_data: dict, previous_hash: str) -> str:
    """
    Compute SHA-256 hash for a transaction to create an immutable chain.
    
    Args:
        tx_data: Dictionary containing transaction data
        previous_hash: Hash of the previous transaction in the chain
    
    Returns:
        SHA-256 hash as hexadecimal string
    """
    hash_input = (
        str(tx_data['dept_id']) +
        str(tx_data['amount']) +
        tx_data['purpose'] +
        tx_data['status'] +
        str(tx_data['created_by_id']) +
        str(tx_data.get('approved_by_id', '')) +
        (tx_data.get('invoice_url') or '') +
        str(tx_data['created_at']) +
        (previous_hash or '')
    )
    return hashlib.sha256(hash_input.encode('utf-8')).hexdigest()

def hash_password(password: str) -> str:
    """
    Hash a password using SHA-256 with salt (simple implementation).
    In production, use proper libraries like bcrypt.
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password as string
    """
    salt = "transparency_ledger_salt"  # In production, use random salts
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        password: Plain text password
        hashed: Hashed password
    
    Returns:
        True if password matches, False otherwise
    """
    return hash_password(password) == hashed

def calculate_department_total_spending(dept_id: str, transactions: list) -> float:
    """
    Calculate total spending for a department from a list of transactions.
    
    Args:
        dept_id: Department ID
        transactions: List of transaction objects
    
    Returns:
        Total spending amount (positive number)
    """
    total = 0.0
    for tx in transactions:
        if str(tx.dept_id) == str(dept_id) and tx.amount < 0:
            total += abs(float(tx.amount))
    return total

def build_department_hierarchy(departments: list) -> dict:
    """
    Build a hierarchical structure from a flat list of departments.
    
    Args:
        departments: List of department objects
    
    Returns:
        Dictionary representing the hierarchy
    """
    dept_map = {}
    root_depts = []
    
    # Create a map of all departments
    for dept in departments:
        dept_map[str(dept.dept_id)] = {
            "dept_id": str(dept.dept_id),
            "name": dept.name,
            "description": dept.description,
            "allocated_budget": float(dept.allocated_budget),
            "parent_dept_id": str(dept.parent_dept_id) if dept.parent_dept_id else None,
            "children": []
        }
    
    # Build the hierarchy
    for dept in departments:
        dept_id = str(dept.dept_id)
        parent_id = str(dept.parent_dept_id) if dept.parent_dept_id else None
        
        if parent_id and parent_id in dept_map:
            dept_map[parent_id]["children"].append(dept_map[dept_id])
        else:
            root_depts.append(dept_map[dept_id])
    
    return {
        "departments": root_depts,
        "total_departments": len(departments)
    }

def validate_budget_allocation(parent_dept, allocated_amount: float, existing_allocations: float) -> bool:
    """
    Validate if a budget allocation is within the parent department's budget.
    
    Args:
        parent_dept: Parent department object
        allocated_amount: Amount to be allocated
        existing_allocations: Sum of existing allocations to other sub-departments
    
    Returns:
        True if allocation is valid, False otherwise
    """
    if not parent_dept:
        return True  # Root department, no parent constraint
    
    parent_budget = float(parent_dept.allocated_budget)
    total_after_allocation = existing_allocations + allocated_amount
    
    return total_after_allocation <= parent_budget

def format_currency(amount: float) -> str:
    """
    Format an amount as currency string.
    
    Args:
        amount: Numeric amount
    
    Returns:
        Formatted currency string
    """
    return f"${amount:,.2f}"

def sanitize_input(text: str) -> str:
    """
    Basic input sanitization to prevent XSS and other issues.
    
    Args:
        text: Input text
    
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove potential HTML tags and script content
    import re
    text = re.sub(r'<[^>]*>', '', text)
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    text = text.strip()
    
    return text
