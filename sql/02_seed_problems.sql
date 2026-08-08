-- CodeMentor AI — problem library seed
-- Run AFTER 01_schema.sql. Safe to re-run: deletes and re-inserts by slug.
--
-- HONEST SCOPE NOTE: this seeds 10 fully-verified problems across 16 topic
-- tags (Arrays, HashMap, HashSet, String, Sorting, DP, Greedy, Stack,
-- Binary Search, Memoization, Recursion, Math, Sliding Window,
-- Bit Manipulation, Heap, Priority Queue). The Problems page topic filter
-- lists the full requested topic taxonomy (Trie, Union Find, Segment Tree,
-- System Design, SQL, etc.) so the UI is ready for them, but no problems are
-- seeded for those yet — add more by copying this file's pattern rather than
-- claiming coverage that doesn't exist.
--
-- Every problem's starter code is a complete stdin -> stdout program (the
-- same pattern real judges use), so the `judge` Edge Function can execute
-- submissions with Piston and diff real output against real expected output.

begin;

delete from public.problems where slug in (
  'two-sum', 'valid-anagram', 'contains-duplicate', 'maximum-subarray',
  'valid-parentheses', 'binary-search', 'climbing-stairs',
  'longest-substring-without-repeating-characters', 'single-number',
  'kth-largest-element-in-an-array'
);

-- ============================================================
-- 1. Two Sum
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'two-sum', 'Two Sum', 'Easy',
    'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice.',
    '2 <= nums.length <= 10^4' || chr(10) || '-10^9 <= nums[i] <= 10^9' || chr(10) || 'Exactly one valid answer exists.',
    array['Arrays','HashMap'], array['Google','Amazon','Meta'],
    jsonb_build_object(
      'javascript', E'function twoSum(nums, target) {\n  // Write your solution here\n  return [];\n}\n\nconst lines = require(\'fs\').readFileSync(0, \'utf8\').trim().split(\'\\n\');\nconst nums = lines[0].trim().split(/\\s+/).map(Number);\nconst target = parseInt(lines[1], 10);\nconsole.log(twoSum(nums, target).join(\' \'));\n',
      'python', E'def two_sum(nums, target):\n    # Write your solution here\n    return []\n\nimport sys\ndata = sys.stdin.read().strip().split(\'\\n\')\nnums = list(map(int, data[0].split()))\ntarget = int(data[1])\nprint(\' \'.join(map(str, two_sum(nums, target))))\n'
    ),
    1
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 'nums = [2,7,11,15], target = 9', '[0,1]', 'nums[0] + nums[1] = 2 + 7 = 9' from p
union all
select id, 2, 'nums = [3,2,4], target = 6', '[1,2]', 'nums[1] + nums[2] = 2 + 4 = 6' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, E'2 7 11 15\n9', '0 1', false, true, 1 from public.problems where slug = 'two-sum'
union all
select id, E'3 2 4\n6', '1 2', false, true, 2 from public.problems where slug = 'two-sum'
union all
select id, E'3 3\n6', '0 1', true, false, 3 from public.problems where slug = 'two-sum'
union all
select id, E'1 2 3 4 5\n9', '3 4', true, false, 4 from public.problems where slug = 'two-sum';

-- ============================================================
-- 2. Valid Anagram
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'valid-anagram', 'Valid Anagram', 'Easy',
    'Given two strings `s` and `t`, return true if `t` is an anagram of `s`, and false otherwise.',
    '1 <= s.length, t.length <= 5 * 10^4',
    array['HashMap','Strings','Sorting'], array['Amazon','Bloomberg'],
    jsonb_build_object(
      'javascript', E'function isAnagram(s, t) {\n  // Write your solution here\n  return false;\n}\n\nconst lines = require(\'fs\').readFileSync(0, \'utf8\').split(\'\\n\');\nconst s = lines[0] ?? \'\';\nconst t = lines[1] ?? \'\';\nconsole.log(isAnagram(s, t) ? \'true\' : \'false\');\n',
      'python', E'def is_anagram(s, t):\n    # Write your solution here\n    return False\n\nimport sys\ndata = sys.stdin.read().split(\'\\n\')\ns = data[0] if len(data) > 0 else \'\'\nt = data[1] if len(data) > 1 else \'\'\nprint(\'true\' if is_anagram(s, t) else \'false\')\n'
    ),
    2
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 's = "anagram", t = "nagaram"', 'true', 'Both strings contain the same letters with the same frequency.' from p
union all
select id, 2, 's = "rat", t = "car"', 'false', 'The letters do not match.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, E'anagram\nnagaram', 'true', false, true, 1 from public.problems where slug = 'valid-anagram'
union all
select id, E'rat\ncar', 'false', false, true, 2 from public.problems where slug = 'valid-anagram'
union all
select id, E'a\nab', 'false', true, false, 3 from public.problems where slug = 'valid-anagram'
union all
select id, E'\n', 'true', true, false, 4 from public.problems where slug = 'valid-anagram';

-- ============================================================
-- 3. Contains Duplicate
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'contains-duplicate', 'Contains Duplicate', 'Easy',
    'Given an integer array `nums`, return true if any value appears at least twice in the array, and false if every element is distinct.',
    '1 <= nums.length <= 10^5',
    array['Arrays','HashSet'], array['Yahoo','Apple'],
    jsonb_build_object(
      'javascript', E'function containsDuplicate(nums) {\n  // Write your solution here\n  return false;\n}\n\nconst raw = (require(\'fs\').readFileSync(0, \'utf8\').split(\'\\n\')[0] ?? \'\').trim();\nconst nums = raw.length ? raw.split(/\\s+/).map(Number) : [];\nconsole.log(containsDuplicate(nums) ? \'true\' : \'false\');\n',
      'python', E'def contains_duplicate(nums):\n    # Write your solution here\n    return False\n\nimport sys\nraw = sys.stdin.read().split(\'\\n\')[0].strip()\nnums = list(map(int, raw.split())) if raw else []\nprint(\'true\' if contains_duplicate(nums) else \'false\')\n'
    ),
    3
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 'nums = [1,2,3,1]', 'true', '1 appears twice.' from p
union all
select id, 2, 'nums = [1,2,3,4]', 'false', 'All elements are distinct.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, '1 2 3 1', 'true', false, true, 1 from public.problems where slug = 'contains-duplicate'
union all
select id, '1 2 3 4', 'false', false, true, 2 from public.problems where slug = 'contains-duplicate'
union all
select id, '1 1 1 3 3 4 3 2 4 2', 'true', true, false, 3 from public.problems where slug = 'contains-duplicate';

-- ============================================================
-- 4. Maximum Subarray
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'maximum-subarray', 'Maximum Subarray', 'Medium',
    'Given an integer array `nums`, find the contiguous subarray with the largest sum, and return that sum.',
    '1 <= nums.length <= 10^5' || chr(10) || '-10^4 <= nums[i] <= 10^4',
    array['Arrays','Dynamic Programming','Greedy'], array['Microsoft','LinkedIn'],
    jsonb_build_object(
      'javascript', E'function maxSubArray(nums) {\n  // Write your solution here\n  return 0;\n}\n\nconst raw = (require(\'fs\').readFileSync(0, \'utf8\').split(\'\\n\')[0] ?? \'\').trim();\nconst nums = raw.split(/\\s+/).map(Number);\nconsole.log(maxSubArray(nums));\n',
      'python', E'def max_sub_array(nums):\n    # Write your solution here\n    return 0\n\nimport sys\nraw = sys.stdin.read().split(\'\\n\')[0].strip()\nnums = list(map(int, raw.split()))\nprint(max_sub_array(nums))\n'
    ),
    4
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 'nums = [-2,1,-3,4,-1,2,1,-5,4]', '6', 'The subarray [4,-1,2,1] has the largest sum 6.' from p
union all
select id, 2, 'nums = [1]', '1', 'The only subarray is [1].' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, '-2 1 -3 4 -1 2 1 -5 4', '6', false, true, 1 from public.problems where slug = 'maximum-subarray'
union all
select id, '1', '1', false, true, 2 from public.problems where slug = 'maximum-subarray'
union all
select id, '5 4 -1 7 8', '23', true, false, 3 from public.problems where slug = 'maximum-subarray'
union all
select id, '-1 -2 -3', '-1', true, false, 4 from public.problems where slug = 'maximum-subarray';

-- ============================================================
-- 5. Valid Parentheses
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'valid-parentheses', 'Valid Parentheses', 'Easy',
    'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid: every opening bracket must be closed by the same type of bracket, in the correct order.',
    '1 <= s.length <= 10^4',
    array['Stack','Strings'], array['Google','Facebook'],
    jsonb_build_object(
      'javascript', E'function isValid(s) {\n  // Write your solution here\n  return false;\n}\n\nconst s = require(\'fs\').readFileSync(0, \'utf8\').split(\'\\n\')[0] ?? \'\';\nconsole.log(isValid(s) ? \'true\' : \'false\');\n',
      'python', E'def is_valid(s):\n    # Write your solution here\n    return False\n\nimport sys\ns = sys.stdin.read().split(\'\\n\')[0]\nprint(\'true\' if is_valid(s) else \'false\')\n'
    ),
    5
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 's = "()"', 'true', 'A single matched pair.' from p
union all
select id, 2, 's = "(]"', 'false', 'Mismatched bracket types.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, '()', 'true', false, true, 1 from public.problems where slug = 'valid-parentheses'
union all
select id, '()[]{}', 'true', false, true, 2 from public.problems where slug = 'valid-parentheses'
union all
select id, '(]', 'false', true, false, 3 from public.problems where slug = 'valid-parentheses'
union all
select id, '([)]', 'false', true, false, 4 from public.problems where slug = 'valid-parentheses'
union all
select id, '{[]}', 'true', true, false, 5 from public.problems where slug = 'valid-parentheses';

-- ============================================================
-- 6. Binary Search
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'binary-search', 'Binary Search', 'Easy',
    'Given a sorted array of integers `nums` and an integer `target`, return the index of `target` if it exists, or -1 if it does not.',
    'nums is sorted in ascending order and contains distinct values.',
    array['Binary Search','Arrays'], array['Amazon'],
    jsonb_build_object(
      'javascript', E'function search(nums, target) {\n  // Write your solution here\n  return -1;\n}\n\nconst lines = require(\'fs\').readFileSync(0, \'utf8\').trim().split(\'\\n\');\nconst nums = lines[0].trim().split(/\\s+/).map(Number);\nconst target = parseInt(lines[1], 10);\nconsole.log(search(nums, target));\n',
      'python', E'def search(nums, target):\n    # Write your solution here\n    return -1\n\nimport sys\ndata = sys.stdin.read().strip().split(\'\\n\')\nnums = list(map(int, data[0].split()))\ntarget = int(data[1])\nprint(search(nums, target))\n'
    ),
    6
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 'nums = [-1,0,3,5,9,12], target = 9', '4', '9 is at index 4.' from p
union all
select id, 2, 'nums = [-1,0,3,5,9,12], target = 2', '-1', '2 is not present.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, E'-1 0 3 5 9 12\n9', '4', false, true, 1 from public.problems where slug = 'binary-search'
union all
select id, E'-1 0 3 5 9 12\n2', '-1', false, true, 2 from public.problems where slug = 'binary-search'
union all
select id, E'5\n5', '0', true, false, 3 from public.problems where slug = 'binary-search'
union all
select id, E'2 5\n5', '1', true, false, 4 from public.problems where slug = 'binary-search';

-- ============================================================
-- 7. Climbing Stairs
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'climbing-stairs', 'Climbing Stairs', 'Easy',
    'You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    '1 <= n <= 45',
    array['Dynamic Programming','Memoization','Recursion','Math'], array['Adobe'],
    jsonb_build_object(
      'javascript', E'function climbStairs(n) {\n  // Write your solution here\n  return 0;\n}\n\nconst n = parseInt(require(\'fs\').readFileSync(0, \'utf8\').trim(), 10);\nconsole.log(climbStairs(n));\n',
      'python', E'def climb_stairs(n):\n    # Write your solution here\n    return 0\n\nimport sys\nn = int(sys.stdin.read().strip())\nprint(climb_stairs(n))\n'
    ),
    7
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 'n = 2', '2', '1+1 or 2.' from p
union all
select id, 2, 'n = 3', '3', '1+1+1, 1+2, or 2+1.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, '2', '2', false, true, 1 from public.problems where slug = 'climbing-stairs'
union all
select id, '3', '3', false, true, 2 from public.problems where slug = 'climbing-stairs'
union all
select id, '5', '8', true, false, 3 from public.problems where slug = 'climbing-stairs'
union all
select id, '1', '1', true, false, 4 from public.problems where slug = 'climbing-stairs';

-- ============================================================
-- 8. Longest Substring Without Repeating Characters
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'Medium',
    'Given a string `s`, find the length of the longest substring without repeating characters.',
    '0 <= s.length <= 5 * 10^4',
    array['Sliding Window','HashSet','Strings'], array['Meta','Bloomberg'],
    jsonb_build_object(
      'javascript', E'function lengthOfLongestSubstring(s) {\n  // Write your solution here\n  return 0;\n}\n\nconst s = require(\'fs\').readFileSync(0, \'utf8\').split(\'\\n\')[0] ?? \'\';\nconsole.log(lengthOfLongestSubstring(s));\n',
      'python', E'def length_of_longest_substring(s):\n    # Write your solution here\n    return 0\n\nimport sys\ns = sys.stdin.read().split(\'\\n\')[0]\nprint(length_of_longest_substring(s))\n'
    ),
    8
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 's = "abcabcbb"', '3', 'The answer is "abc", with length 3.' from p
union all
select id, 2, 's = "bbbbb"', '1', 'The answer is "b", with length 1.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, 'abcabcbb', '3', false, true, 1 from public.problems where slug = 'longest-substring-without-repeating-characters'
union all
select id, 'bbbbb', '1', false, true, 2 from public.problems where slug = 'longest-substring-without-repeating-characters'
union all
select id, 'pwwkew', '3', true, false, 3 from public.problems where slug = 'longest-substring-without-repeating-characters'
union all
select id, ' ', '1', true, false, 4 from public.problems where slug = 'longest-substring-without-repeating-characters';

-- ============================================================
-- 9. Single Number
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'single-number', 'Single Number', 'Easy',
    'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one, in linear time and O(1) extra space.',
    '1 <= nums.length <= 3 * 10^4',
    array['Bit Manipulation','Arrays'], array['Airbnb'],
    jsonb_build_object(
      'javascript', E'function singleNumber(nums) {\n  // Write your solution here\n  return 0;\n}\n\nconst raw = require(\'fs\').readFileSync(0, \'utf8\').trim();\nconst nums = raw.split(/\\s+/).map(Number);\nconsole.log(singleNumber(nums));\n',
      'python', E'def single_number(nums):\n    # Write your solution here\n    return 0\n\nimport sys\nraw = sys.stdin.read().strip()\nnums = list(map(int, raw.split()))\nprint(single_number(nums))\n'
    ),
    9
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 'nums = [2,2,1]', '1', '1 appears once; 2 appears twice.' from p
union all
select id, 2, 'nums = [4,1,2,1,2]', '4', '4 appears once.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, '2 2 1', '1', false, true, 1 from public.problems where slug = 'single-number'
union all
select id, '4 1 2 1 2', '4', false, true, 2 from public.problems where slug = 'single-number'
union all
select id, '1', '1', true, false, 3 from public.problems where slug = 'single-number';

-- ============================================================
-- 10. Kth Largest Element in an Array
-- ============================================================
with p as (
  insert into public.problems (slug, title, difficulty, description, constraints, topics, companies, starter_code, order_index)
  values (
    'kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'Medium',
    'Given an integer array `nums` and an integer `k`, return the k-th largest element in the array (the k-th largest in sorted order, not the k-th distinct element).',
    '1 <= k <= nums.length <= 10^5',
    array['Heap','Priority Queue','Sorting','Arrays'], array['Facebook','Uber'],
    jsonb_build_object(
      'javascript', E'function findKthLargest(nums, k) {\n  // Write your solution here\n  return 0;\n}\n\nconst lines = require(\'fs\').readFileSync(0, \'utf8\').trim().split(\'\\n\');\nconst nums = lines[0].trim().split(/\\s+/).map(Number);\nconst k = parseInt(lines[1], 10);\nconsole.log(findKthLargest(nums, k));\n',
      'python', E'def find_kth_largest(nums, k):\n    # Write your solution here\n    return 0\n\nimport sys\ndata = sys.stdin.read().strip().split(\'\\n\')\nnums = list(map(int, data[0].split()))\nk = int(data[1])\nprint(find_kth_largest(nums, k))\n'
    ),
    10
  ) returning id
)
insert into public.problem_examples (problem_id, order_index, input, output, explanation)
select id, 1, 'nums = [3,2,1,5,6,4], k = 2', '5', 'Sorted descending: [6,5,4,3,2,1] — the 2nd largest is 5.' from p
union all
select id, 2, 'nums = [3,2,3,1,2,4,5,5,6], k = 4', '4', 'Sorted descending: [6,5,5,4,3,3,2,2,1] — the 4th largest is 4.' from p;

insert into public.testcases (problem_id, input, expected_output, is_hidden, is_sample, order_index)
select id, E'3 2 1 5 6 4\n2', '5', false, true, 1 from public.problems where slug = 'kth-largest-element-in-an-array'
union all
select id, E'3 2 3 1 2 4 5 5 6\n4', '4', false, true, 2 from public.problems where slug = 'kth-largest-element-in-an-array'
union all
select id, E'1\n1', '1', true, false, 3 from public.problems where slug = 'kth-largest-element-in-an-array';

-- ============================================================
-- Badge definitions (thresholds only — unlock status is always computed
-- live from public.user_stats, never stored/awarded directly)
-- ============================================================
insert into public.badges (code, name, description, requirement_type, requirement_value, requirement_meta) values
  ('accepted_25', '25 Accepted', 'Solve 25 problems.', 'accepted_count', 25, null),
  ('accepted_100', '100 Accepted', 'Solve 100 problems.', 'accepted_count', 100, null),
  ('accepted_500', '500 Accepted', 'Solve 500 problems.', 'accepted_count', 500, null),
  ('streak_7', '7 Day Streak', 'Solve at least one problem 7 days in a row.', 'streak_days', 7, null),
  ('streak_30', '30 Day Streak', 'Solve at least one problem 30 days in a row.', 'streak_days', 30, null),
  ('streak_100', '100 Day Streak', 'Solve at least one problem 100 days in a row.', 'streak_days', 100, null),
  ('hard_solver_10', 'Hard Solver', 'Solve 10 Hard-difficulty problems.', 'hard_solved', 10, null),
  ('accuracy_90', 'Sharp Shooter', 'Reach a 90%+ acceptance rate (min. 10 submissions).', 'acceptance_rate', 90, null)
on conflict (code) do nothing;

commit;
