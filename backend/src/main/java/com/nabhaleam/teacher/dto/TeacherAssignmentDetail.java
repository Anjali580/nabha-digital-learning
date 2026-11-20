package com.nabhaleam.teacher.dto;

import java.util.List;

public record TeacherAssignmentDetail(
        TeacherAssignmentRow assignment,
        List<String> instructions,
        List<TeacherSubmissionRow> submissions
) {
}
